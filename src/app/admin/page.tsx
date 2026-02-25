import Link from "next/link";
import { AdminUploadForm } from "./AdminUploadForm";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-8">
          <Link href="/" className="text-sm text-slate-600 hover:underline dark:text-slate-400">料金表トップ</Link>
        </nav>
        <h1 className="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">管理画面 — CSVアップロード</h1>
        <AdminUploadForm />
      </div>
    </main>
  );
}
