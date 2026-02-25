import Link from "next/link";
import { fetchCatalogLatest } from "@/lib/data/catalog";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string; model?: string }>;
}) {
  const { mode, q, model } = await searchParams;
  const isCustomer = mode === "customer";
  const items = await fetchCatalogLatest();
  const initialModelQuery = typeof model === "string" ? model : typeof q === "string" ? q : "";

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {!isCustomer && (
          <nav className="mb-6">
            <Link href="/" className="text-sm text-slate-600 hover:underline dark:text-slate-400">料金表</Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">検索</span>
          </nav>
        )}
        <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">検索</h1>
        <SearchClient initialItems={items} initialModelQuery={initialModelQuery} isCustomerMode={isCustomer} />
      </div>
    </main>
  );
}
