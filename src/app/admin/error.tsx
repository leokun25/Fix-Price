"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold text-red-700 dark:text-red-400">管理画面でエラーが発生しました</h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{error.message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            再試行
          </button>
          <Link href="/" className="rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200">
            トップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
