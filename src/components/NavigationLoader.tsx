"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * リンククリックを検知して、ページ遷移中にオーバーレイを表示するグローバルローダー。
 * クリック → loading=true、URLが変わる(pathnam変化) → loading=false
 */
export function NavigationLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    // pathname が変わった = 遷移完了
    useEffect(() => {
        setLoading(false);
    }, [pathname]);

    // 内部リンクのクリックを検知
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href) return;
            // 外部リンク・アンカーリンクは除外
            if (href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;
            // 現在と同じページへのリンクは除外
            if (href === pathname) return;
            setLoading(true);
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">読み込み中...</p>
            </div>
        </div>
    );
}
