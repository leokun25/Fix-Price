"use client";

import { useState, useCallback } from "react";
import type { PartItem } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/formatPrice";

type GroupData = { group: string; items: PartItem[] };

/** モーダルダイアログ */
function DetailModal({
  label,
  item,
  onClose,
}: {
  label: string;
  item: PartItem;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(`${label} ${formatPrice(item.price_yen)}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }, [label, item]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="パーツ詳細"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-medium text-slate-500 dark:text-slate-400">
          機種 / パーツ
        </h3>
        <p className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
          {label}
        </p>
        <h3 className="mb-2 text-lg font-medium text-slate-500 dark:text-slate-400">
          価格（税込）
        </h3>
        <p className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
          {formatPrice(item.price_yen)}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500"
          >
            {copied ? "コピーしました" : "コピー"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * パーツグループ内のアイテムをフラットな1行リストで表示。
 * 各行: "{brand}{機種名}（またはサブ名）  ¥価格"
 */
export function PartListClient({
  groups,
  isCustomerMode,
  brand = "",
}: {
  groups: GroupData[];
  isCustomerMode: boolean;
  brand?: string;
}) {
  const [modal, setModal] = useState<{ label: string; item: PartItem } | null>(null);

  return (
    <>
      <ul className="space-y-2">
        {groups.map(({ group, items }) =>
          items.map((item, idx) => {
            // ラベル: "{brand}{group}" または items が複数の場合は part_name を付加
            const suffix =
              items.length > 1 && item.part_name && item.part_name !== group
                ? ` ${item.part_name}`
                : "";
            const label = `${brand}${group}${suffix}`;

            return (
              <li key={`${group}-${idx}`}>
                <button
                  type="button"
                  onClick={() => setModal({ label, item })}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {label}
                  </span>
                  <span
                    className={
                      isCustomerMode
                        ? "text-xl font-bold text-slate-900 dark:text-white"
                        : "text-lg font-semibold text-slate-700 dark:text-slate-200"
                    }
                  >
                    {formatPrice(item.price_yen)}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {modal && (
        <DetailModal
          label={modal.label}
          item={modal.item}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
