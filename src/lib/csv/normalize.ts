export type NormalizedItem = {
  brand: string;
  model: string;
  part_group: string | null;
  part_name: string;
  price_yen: number;
  source_token: string | null;
  source_category: string | null;
};

export type RawCsvRow = Record<string, unknown>;

const get = (row: Record<string, unknown>, key: string): string => {
  const v = row?.[key];
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  if (s.toLowerCase() === "nan") return "";
  return s;
};

/** 列名の BOM・前後スペース対策 */
const getKey = (row: Record<string, unknown>, key: string): string => {
  let v = get(row, key);
  if (v) return v;
  const trimmed = key.trim();
  const found = Object.keys(row || {}).find((k) => k.trim() === trimmed);
  return found ? get(row, found) : "";
};

export const parsePrice = (value: string): number => {
  if (!value) return 0;
  const cleaned = value
    .replace(/[¥￥]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();
  if (!cleaned || cleaned === "価格指定") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};

const splitCategoryCell = (cell: string): string[] => {
  const raw = (cell ?? "").trim();
  if (!raw) return [];
  if (!raw.includes(", ")) return [raw];

  const chunks = raw.split(", ");
  const out: string[] = [];
  let cur = chunks[0];
  const countGT = (s: string) => (s.match(/>/g) ?? []).length;

  for (let i = 1; i < chunks.length; i++) {
    const next = chunks[i];
    if (countGT(cur) === 0 && countGT(next) > 0) {
      cur = `${cur}, ${next}`;
      continue;
    }
    if (countGT(cur) >= 2 && countGT(next) >= 2) {
      out.push(cur);
      cur = next;
      continue;
    }
    cur = `${cur}, ${next}`;
  }
  out.push(cur);
  return out;
};

/**
 * カテゴリを > で分解し、不足階層は補完する。
 * 必ず「ブランド > 機種 > パーツ名」の順（例: iPhone > 12 > パネル）。逆順だと画面で機種がパーツとして表示される。
 * ブランド = 1階層目 / モデル = 2階層目（なければ「その他」）/ 修理内容 = 3階層目（なければ「その他」）
 * カテゴリ不足によるスキップはしない。
 */
const parseCategoryPath = (path: string): { brand: string; model: string; partGroup: string } => {
  const parts = path.split(">").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { brand: "その他", model: "その他", partGroup: "その他" };

  const brandRaw = parts[0];
  const brand = brandRaw.split(",").pop()?.trim() || brandRaw.trim();
  const model = parts.length >= 2 ? parts[1] : "その他";
  const partGroup = parts.length >= 3 ? parts.slice(2).join(" > ") : "その他";

  return { brand, model, partGroup };
};

/**
 * Square CSV row -> NormalizedItem[]
 * - カテゴリは > 区切りで分解し、不足階層は「その他」で補完。カテゴリ不足によるスキップはしない。
 * - 価格は数値/0/「価格指定」/空 いずれも保存（0として保存）。価格理由によるスキップはしない。
 */
export const normalizeRow = (row: RawCsvRow): NormalizedItem[] => {
  const categoryCell = getKey(row, "カテゴリ");
  const variation = getKey(row, "バリエーション名");
  const token = getKey(row, "トークン") || null;

  const priceRaw = getKey(row, "価格") || getKey(row, "販売価格");
  const price_yen = parsePrice(priceRaw);

  const paths = splitCategoryCell(categoryCell);
  const items: NormalizedItem[] = [];
  const toProcess = paths.length > 0 ? paths : [""];

  for (const p of toProcess) {
    const parsed = parseCategoryPath(p);
    const part_name = variation ? `${parsed.partGroup} ${variation}` : parsed.partGroup;

    items.push({
      brand: parsed.brand,
      model: parsed.model,
      part_group: parsed.partGroup,
      part_name,
      price_yen,
      source_token: token,
      source_category: categoryCell || null,
    });
  }

  return items;
};

export function dedupeItems(items: NormalizedItem[]): NormalizedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = [item.brand, item.model, item.part_group ?? "", item.part_name, item.price_yen].join("\0");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseCsvToNormalizedItems(rows: RawCsvRow[]): {
  items: NormalizedItem[];
  errors: string[];
} {
  const errors: string[] = [];
  const allItems: NormalizedItem[] = [];
  rows.forEach((row, index) => {
    try {
      allItems.push(...normalizeRow(row));
    } catch (e) {
      errors.push(`行${index + 2}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
  return { items: dedupeItems(allItems), errors };
}
