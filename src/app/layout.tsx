import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { NavigationLoader } from "@/components/NavigationLoader";

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
        <NavigationLoader />
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mx-auto max-w-6xl space-y-2">
            {/* 1行目: ホーム / 管理画面 */}
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/"
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                ホーム
              </Link>
              <Link
                href="/admin"
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                管理画面
              </Link>
            </div>
            {/* 2行目: 検索バー（全幅） */}
            <Suspense fallback={<div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />}>
              <GlobalSearchBar />
            </Suspense>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
