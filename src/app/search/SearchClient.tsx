"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PartItem } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/formatPrice";
import { partGroupSortKey } from "@/lib/partGroupOrder";

const MAX_VISIBLE = 300;

/** 修理内容チップ：表示ラベルと、part_group / part_name のマッチ条件 */
const REPAIR_CHIPS: { label: string; match: (item: PartItem) => boolean }[] = [
  { label: "パネル", match: (i) => /パネル/.test(i.part_group ?? "") || /パネル/.test(i.part_name ?? "") },
  { label: "バッテリー", match: (i) => /バッテリー/.test(i.part_group ?? "") || /バッテリー/.test(i.part_name ?? "") },
  { label: "背面", match: (i) => /バック|背面/.test(i.part_group ?? "") || /バック|背面/.test(i.part_name ?? "") },
  { label: "カメラ", match: (i) => /カメラ/.test(i.part_group ?? "") || /カメラ/.test(i.part_name ?? "") },
  { label: "水没", match: (i) => /水没/.test(i.part_group ?? "") || /水没/.test(i.part_name ?? "") },
];

function sortResultsByPartOrder(items: PartItem[]): PartItem[] {
  return [...items].sort((a, b) => {
    const pa = partGroupSortKey(a.part_group);
    const pb = partGroupSortKey(b.part_group);
    if (pa !== pb) return pa - pb;
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    if (a.model !== b.model) return a.model.localeCompare(b.model);
    return (a.part_name ?? "").localeCompare(b.part_name ?? "");
  });
}

export function SearchClient({
  initialItems,
  initialModelQuery = "",
  isCustomerMode,
}: {
  initialItems: PartItem[];
  initialModelQuery?: string;
  isCustomerMode: boolean;
}) {
  const [modelQuery, setModelQuery] = useState(initialModelQuery);
  const [selectedRepair, setSelectedRepair] = useState<Set<string>>(new Set());

  const modelQueryNorm = modelQuery.trim().toLowerCase();

  const results = useMemo(() => {
    let list: PartItem[] = initialItems;

    if (modelQueryNorm) {
      list = initialItems.filter(
        (item) => item.model.toLowerCase().includes(modelQueryNorm)
      );
    }

    if (selectedRepair.size > 0) {
      const repairLabels = Array.from(selectedRepair);
      list = list.filter((item) =>
        repairLabels.some((label) => {
          const chip = REPAIR_CHIPS.find((c) => c.label === label);
          return chip?.match(item);
        })
      );
    }

    if (!modelQueryNorm && selectedRepair.size === 0) {
      list = list.slice(0, 80);
    }

    return sortResultsByPartOrder(list);
  }, [modelQueryNorm, selectedRepair, initialItems]);

  const total = results.length;
  const visible = results.slice(0, MAX_VISIBLE);

  const toggleRepair = (label: string) => {
    setSelectedRepair((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <>
      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">機種</label>
          <input
            type="search"
            value={modelQuery}
            onChange={(e) => setModelQuery(e.target.value)}
            placeholder="例：iPhone 14 / A52 / P30"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            autoFocus={!initialModelQuery}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">修理内容</label>
          <div className="flex flex-wrap gap-2">
            {REPAIR_CHIPS.map(({ label }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleRepair(label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedRepair.has(label)
                    ? "bg-slate-800 text-white dark:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        {modelQuery.trim() || selectedRepair.size > 0
          ? `${total.toLocaleString()} 件`
          : "機種または修理内容を選ぶと絞り込めます"}
      </p>

      <ul className="space-y-3">
        {visible.map((item) => (
          <li key={item.id}>
            <Link
              href={isCustomerMode ? `/${encodeURIComponent(item.brand)}/${encodeURIComponent(item.model)}?mode=customer` : `/${encodeURIComponent(item.brand)}/${encodeURIComponent(item.model)}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{item.model}</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">{formatPrice(item.price_yen)}</span>
              </div>
              <div className="mt-1 text-slate-700 dark:text-slate-200">
                {item.part_name ?? item.part_group ?? "—"}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {item.brand}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {total > MAX_VISIBLE && (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          上位 {MAX_VISIBLE} 件を表示中（全 {total.toLocaleString()} 件）
        </p>
      )}
      {total === 0 && (modelQuery.trim() || selectedRepair.size > 0) && (
        <p className="py-12 text-center text-slate-500 dark:text-slate-400">
          該当するパーツがありません。機種や修理内容を変えて試してください。
        </p>
      )}
    </>
  );
}
