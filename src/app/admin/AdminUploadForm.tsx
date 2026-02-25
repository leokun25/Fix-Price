"use client";

import { useState } from "react";

type Result =
  | { success: true; importId: string; totalRows: number; normalizedCount: number; parseErrors?: string[]; detectedColumns?: string[] }
  | { success: false; error: string; detail?: string; parseErrors?: string[]; insertErrors?: string[] };

export function AdminUploadForm() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [encoding, setEncoding] = useState<"utf8" | "shift_jis">("utf8");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setResult({ success: false, error: "パスワードを入力してください。" });
      return;
    }
    if (!file) {
      setResult({ success: false, error: "CSVファイルを選択してください。" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      if (note.trim()) formData.set("note", note.trim());
      if (encoding === "shift_jis") formData.set("encoding", "shift_jis");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${password}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({
          success: false,
          error: data.error ?? "アップロードに失敗しました",
          detail: data.detail,
          parseErrors: data.parseErrors,
          insertErrors: data.insertErrors,
        });
        return;
      }
      setResult({
        success: true,
        importId: data.importId,
        totalRows: data.totalRows,
        normalizedCount: data.normalizedCount,
        parseErrors: data.parseErrors,
        detectedColumns: data.detectedColumns,
      });
      setFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setResult({
        success: false,
        error: "リクエストに失敗しました",
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">管理パスワード</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="ADMIN_PASSWORD"
          autoComplete="current-password"
        />
      </div>
      <div>
        <label htmlFor="csv-file" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Square 商品CSV</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">CSV 文字コード</label>
        <select
          value={encoding}
          onChange={(e) => setEncoding(e.target.value as "utf8" | "shift_jis")}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="utf8">UTF-8</option>
          <option value="shift_jis">Shift_JIS（Excelなど）</option>
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">メモ（任意）</label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="例: 2025年2月更新"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-800 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
      >
        {loading ? "アップロード中..." : "アップロード"}
      </button>
      {result && (
        <div className={`rounded-xl border p-4 ${result.success ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20" : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"}`}>
          {result.success ? (
            <>
              <p className="font-semibold text-green-800 dark:text-green-200">アップロード完了</p>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                インポートID: {result.importId} / CSV行数: {result.totalRows} / 正規化件数: {result.normalizedCount}
              </p>
              {result.totalRows > result.normalizedCount && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  CSV {result.totalRows} 行 → 正規化後 {result.normalizedCount} 件（重複は1件にまとめています）
                </p>
              )}
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                料金表で利用する列は「カテゴリ」「商品名」「バリエーション名」「価格」「トークン」のみです。在庫・店舗別価格・カスタマイズグループ等は保存していません。
              </p>
              {Array.isArray(result.detectedColumns) && result.detectedColumns.length > 0 && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  検出した列: {result.detectedColumns.join(", ")}
                </p>
              )}
              {result.parseErrors && result.parseErrors.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-amber-700 dark:text-amber-300">パース警告 {result.parseErrors.length} 件</summary>
                  <ul className="mt-2 max-h-40 overflow-auto text-xs text-amber-800 dark:text-amber-200">
                    {result.parseErrors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold text-red-800 dark:text-red-200">{result.error}</p>
              {result.detail && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{result.detail}</p>}
              {Array.isArray(result.parseErrors) && result.parseErrors.length > 0 && (
                <ul className="mt-2 max-h-40 overflow-auto text-xs text-red-600 dark:text-red-400">
                  {result.parseErrors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
              {Array.isArray(result.insertErrors) && result.insertErrors.length > 0 && (
                <ul className="mt-2 max-h-40 overflow-auto text-xs text-red-600 dark:text-red-400">
                  {result.insertErrors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
