import Link from "next/link";
import { fetchCatalogLatest, getDistinctBrands } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await fetchCatalogLatest();
  const brands = getDistinctBrands(items);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">料金表</h1>
        </header>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          読み込み済み: 全 {items.length.toLocaleString()} 件（{brands.length} ブランド）
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {brands.map(({ brand }) => (
            <Link
              key={brand}
              href={`/${encodeURIComponent(brand)}`}
              className="flex min-h-[100px] items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
            >
              {brand}
            </Link>
          ))}
        </div>
        {brands.length === 0 && (
          <p className="mt-12 text-center text-slate-500 dark:text-slate-400">
            ブランドがありません。管理画面からCSVをアップロードしてください。
          </p>
        )}
      </div>
    </main>
  );
}
