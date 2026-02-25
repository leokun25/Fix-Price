import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCatalogLatest, getDistinctPartNames } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

/**
 * ブランド → パーツ名タイル一覧
 * DBの model カラム = パーツ名（Rカメラ、パネル、バッテリー等）
 * ナビ順: ブランド > パーツ名 > 機種名
 */
export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { brand: brandEnc } = await params;
  const { mode } = await searchParams;
  const brand = decodeURIComponent(brandEnc);
  const isCustomer = mode === "customer";

  const items = await fetchCatalogLatest();
  const partNames = getDistinctPartNames(items, brand);
  if (partNames.length === 0) notFound();

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {!isCustomer && (
          <nav className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href={mode ? "/?mode=customer" : "/"} className="hover:underline">
              料金表
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{brand}</span>
          </nav>
        )}
        <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">{brand}</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {partNames.map(({ partName }) => (
            <Link
              key={partName}
              href={
                isCustomer
                  ? `/${encodeURIComponent(brand)}/${encodeURIComponent(partName)}?mode=customer`
                  : `/${encodeURIComponent(brand)}/${encodeURIComponent(partName)}`
              }
              className="flex min-h-[90px] items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
            >
              {partName}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
