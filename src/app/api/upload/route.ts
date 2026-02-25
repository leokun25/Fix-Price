import { parse } from "csv-parse/sync";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  parseCsvToNormalizedItems,
  type NormalizedItem,
  type RawCsvRow,
} from "@/lib/csv/normalize";

const BATCH_SIZE = 500;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const authHeader = request.headers.get("authorization");
  return !!(authHeader?.startsWith("Bearer ") && authHeader.slice(7) === ADMIN_PASSWORD);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const file = formData.get("file") as File | null;
  const note = (formData.get("note") as string)?.trim() ?? null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid file (use field name: file)" },
      { status: 400 }
    );
  }
  const filename = file.name;
  const encoding = formData.get("encoding") as string | null;
  const useShiftJis = encoding === "shift_jis" || encoding === "sjis";
  let text: string;
  try {
    if (useShiftJis) {
      const buf = await file.arrayBuffer();
      text = new TextDecoder("shift_jis").decode(buf);
    } else {
      text = await file.text();
    }
  } catch (e) {
    return NextResponse.json({
      error: "Failed to read file",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 400 });
  }
  let rows: RawCsvRow[];
  try {
    rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    }) as RawCsvRow[];
  } catch (e) {
    return NextResponse.json({
      error: "CSV parse failed",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 400 });
  }
  const { items, errors: parseErrors } = parseCsvToNormalizedItems(rows);
  const supabase = createServerSupabaseClient();
  const { data: importRow, error: insertImportError } = await supabase
    .from("imports")
    .insert({ original_filename: filename, note })
    .select("id")
    .single();
  if (insertImportError || !importRow) {
    return NextResponse.json({
      error: "Failed to create import record",
      detail: insertImportError?.message ?? "No id returned",
    }, { status: 500 });
  }
  const importId = importRow.id;
  const insertErrors: string[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const rowsToInsert = batch.map((item: NormalizedItem) => ({
      import_id: importId,
      brand: item.brand,
      model: item.model,
      part_group: item.part_group,
      part_name: item.part_name,
      price_yen: item.price_yen,
      source_token: item.source_token || null,
      source_category: item.source_category || null,
      is_active: true,
    }));
    const { error: batchError } = await supabase.from("catalog_items").insert(rowsToInsert);
    if (batchError) insertErrors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchError.message}`);
  }
  if (insertErrors.length > 0) {
    return NextResponse.json({
      error: "Some batches failed to insert",
      importId,
      parseErrors,
      insertErrors,
    }, { status: 207 });
  }
  return NextResponse.json({
    success: true,
    importId,
    totalRows: rows.length,
    normalizedCount: items.length,
    parseErrors: parseErrors.length ? parseErrors : undefined,
    detectedColumns: rows[0] ? Object.keys(rows[0]) : [],
  });
}
