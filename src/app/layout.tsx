import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";

export const metadata: Metadata = {
  title: "料金表 | Square 商品",
  description: "Square商品CSVから生成した料金表",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <Link
              href="/"
              className="shrink-0 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              ホーム
            </Link>
            <Suspense fallback={<div className="h-9 flex-1 max-w-md" />}>
              <GlobalSearchBar />
            </Suspense>
            <Link
              href="/admin"
              className="shrink-0 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              管理画面
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
