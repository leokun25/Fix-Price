import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCatalogLatest,
  getItemsByBrandAndPartName,
  groupItemsByMachineModel,
} from "@/lib/data/catalog";
import { PartListClient } from "./PartListClient";

export const dynamic = "force-dynamic";

/**
 * パーツ名 → 機種ごとの料金一覧
 * URL の [model] セグメント = パーツ名（model カラムの値）
 * ナビ順: ブランド > パーツ名 > 機種名
 */
export default async function PartNamePage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; model: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { brand: brandEnc, model: partNameEnc } = await params;
  const { mode } = await searchParams;
  const brand = decodeURIComponent(brandEnc);
  const partName = decodeURIComponent(partNameEnc);
  const isCustomer = mode === "customer";

  const items = await fetchCatalogLatest();
  // model カラム = パーツ名でフィルタ
  const parts = getItemsByBrandAndPartName(items, brand, partName);
  if (parts.length === 0) notFound();

  // part_group カラム = 機種名でグループ化（発売日順）
  const modelGroups = groupItemsByMachineModel(parts, brand);
  const groups = modelGroups.map(({ machineModel, items: groupItems }) => ({
    group: machineModel,
    items: groupItems,
  }));

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {!isCustomer && (
          <nav className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href={mode ? "/?mode=customer" : "/"} className="hover:underline">
              料金表
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={
                isCustomer
                  ? `/${encodeURIComponent(brand)}?mode=customer`
                  : `/${encodeURIComponent(brand)}`
              }
              className="hover:underline"
            >
              {brand}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{partName}</span>
          </nav>
        )}
        <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
          {brand} — {partName}
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">機種ごとの料金一覧</p>
        <PartListClient groups={groups} isCustomerMode={isCustomer} brand={brand} />
      </div>
    </main>
  );
}
