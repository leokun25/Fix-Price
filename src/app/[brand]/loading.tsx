export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
                <p className="text-sm text-slate-500 dark:text-slate-400">読み込み中...</p>
            </div>
        </div>
    );
}
