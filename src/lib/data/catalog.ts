import type { CatalogLatestRow } from "@/lib/supabase/types";
import { getModelGroupKey, getReleaseSortKey, getBrandReleaseSortKey, sortModelsByReleaseDate } from "@/lib/modelReleaseOrder";
import { partGroupSortKey } from "@/lib/partGroupOrder";

export type PartItem = CatalogLatestRow;

const PAGE_SIZE = 1000;

/** ブランドの表示順（トップページ）。この順で先頭に表示 */
const BRAND_PRIORITY_ORDER = ["iPhone", "iPad", "Xperia", "Galaxy", "HUAWEI"];
/** ゲーム機系ブランド。この順で末尾に表示 */
const GAME_CONSOLE_BRANDS = ["PlayStation", "PS", "Switch", "XBOX"];

function brandSortKey(brand: string): { group: number; index: number } {
  const lower = brand.toLowerCase();
  const priorityIndex = BRAND_PRIORITY_ORDER.findIndex((b) => b.toLowerCase() === lower);
  if (priorityIndex >= 0) return { group: 0, index: priorityIndex };
  const gameIndex = GAME_CONSOLE_BRANDS.findIndex((b) => b.toLowerCase() === lower);
  if (gameIndex >= 0) return { group: 2, index: gameIndex };
  return { group: 1, index: 0 };
}

export async function fetchCatalogLatest(): Promise<CatalogLatestRow[]> {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const all: CatalogLatestRow[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("catalog_latest")
      .select("*")
      .order("brand", { ascending: true })
      .order("model", { ascending: true })
      .order("part_group", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as CatalogLatestRow[];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

export function getDistinctBrands(items: CatalogLatestRow[]): { brand: string }[] {
  const set = new Set<string>();
  items.forEach((r) => set.add(r.brand));
  return Array.from(set, (brand) => ({ brand })).sort((a, b) => {
    const ka = brandSortKey(a.brand);
    const kb = brandSortKey(b.brand);
    if (ka.group !== kb.group) return ka.group - kb.group;
    if (ka.index !== kb.index) return ka.index - kb.index;
    return a.brand.localeCompare(b.brand);
  });
}

/** ブランド別のパーツグループ（パーツ名）一覧。未分類は "未分類" として返す。表示順は PART_GROUP_ORDER に従う */
export function getPartGroupsByBrand(
  items: CatalogLatestRow[],
  brand: string
): { partGroup: string }[] {
  const set = new Set<string>();
  items
    .filter((r) => r.brand === brand)
    .forEach((r) => set.add(r.part_group ?? "未分類"));
  return Array.from(set, (partGroup) => ({ partGroup })).sort((a, b) => {
    const orderA = partGroupSortKey(a.partGroup);
    const orderB = partGroupSortKey(b.partGroup);
    if (orderA !== orderB) return orderA - orderB;
    return a.partGroup.localeCompare(b.partGroup);
  });
}

/** 指定ブランド・パーツグループに属する全アイテム（機種に全部の一覧用） */
export function getItemsByBrandAndPartGroup(
  items: CatalogLatestRow[],
  brand: string,
  partGroupLabel: string
): PartItem[] {
  const isUnclassified = partGroupLabel === "未分類";
  return items
    .filter(
      (r) =>
        r.brand === brand &&
        (isUnclassified ? r.part_group == null : (r.part_group ?? "未分類") === partGroupLabel)
    )
    .sort((a, b) => {
      const keyA = getReleaseSortKey(a.model);
      const keyB = getReleaseSortKey(b.model);
      if (keyA !== keyB) return keyA - keyB;
      return (a.part_name ?? "").localeCompare(b.part_name ?? "");
    });
}

/** パーツ一覧を機種ごとにまとめる（機種に全部の表示用） */
export function groupPartsByModel(
  parts: PartItem[]
): { model: string; items: PartItem[] }[] {
  const byModel = new Map<string, PartItem[]>();
  for (const p of parts) {
    const m = p.model;
    if (!byModel.has(m)) byModel.set(m, []);
    byModel.get(m)!.push(p);
  }
  const sorted = sortModelsByReleaseDate(Array.from(byModel.keys()));
  return sorted.map((model) => ({ model, items: byModel.get(model)! }));
}

export function getModelsByBrand(
  items: CatalogLatestRow[],
  brand: string
): { model: string }[] {
  const set = new Set<string>();
  items.filter((r) => r.brand === brand).forEach((r) => set.add(r.model));
  const sorted = sortModelsByReleaseDate(Array.from(set));
  return sorted.map((model) => ({ model }));
}

export type ModelGroup = {
  groupKey: string;
  displayName: string;
  models: string[];
  canonicalModel: string;
};

/** 12・12Pro・12/12Pro を1タイルにまとめたグループ一覧 */
export function getModelGroupsByBrand(
  items: CatalogLatestRow[],
  brand: string
): ModelGroup[] {
  const modelSet = new Set<string>();
  items.filter((r) => r.brand === brand).forEach((r) => modelSet.add(r.model));
  const sortedModels = sortModelsByReleaseDate(Array.from(modelSet));

  const byGroup = new Map<string, string[]>();
  for (const model of sortedModels) {
    const key = getModelGroupKey(model);
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push(model);
  }

  return Array.from(byGroup.entries()).map(([groupKey, models]) => ({
    groupKey,
    displayName: models.length === 1 ? models[0] : models.join("・"),
    models,
    canonicalModel: models[0],
  }));
}

/** 指定 model と同じグループに属する機種名の一覧（URL から開いたときにまとめて表示する用） */
export function getModelsInSameGroup(
  items: CatalogLatestRow[],
  brand: string,
  model: string
): string[] {
  const allModels = Array.from(
    new Set(items.filter((r) => r.brand === brand).map((r) => r.model))
  );
  const key = getModelGroupKey(model);
  return allModels.filter((m) => getModelGroupKey(m) === key);
}

/** 複数機種のパーツをまとめて取得 */
export function getPartsByBrandAndModels(
  items: CatalogLatestRow[],
  brand: string,
  models: string[]
): PartItem[] {
  const set = new Set(models);
  return items
    .filter((r) => r.brand === brand && set.has(r.model))
    .sort((a, b) => {
      const ga = a.part_group ?? null;
      const gb = b.part_group ?? null;
      const orderA = partGroupSortKey(ga);
      const orderB = partGroupSortKey(gb);
      if (orderA !== orderB) return orderA - orderB;
      return (a.part_name ?? "").localeCompare(b.part_name ?? "");
    });
}

export function getPartsByBrandAndModel(
  items: CatalogLatestRow[],
  brand: string,
  model: string
): PartItem[] {
  return items
    .filter((r) => r.brand === brand && r.model === model)
    .sort((a, b) => {
      const orderA = partGroupSortKey(a.part_group ?? null);
      const orderB = partGroupSortKey(b.part_group ?? null);
      if (orderA !== orderB) return orderA - orderB;
      return (a.part_name ?? "").localeCompare(b.part_name ?? "");
    });
}

export function groupPartsByPartGroup(
  parts: PartItem[]
): { group: string | null; items: PartItem[] }[] {
  const map = new Map<string | null, PartItem[]>();
  for (const p of parts) {
    const g = p.part_group ?? null;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(p);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const orderA = partGroupSortKey(a);
      const orderB = partGroupSortKey(b);
      if (orderA !== orderB) return orderA - orderB;
      return (a ?? "").localeCompare(b ?? "");
    })
    .map(([group, items]) => ({ group, items }));
}

// ============================================================
// 実際のDBデータ構造に基づく関数
//   model カラム      = パーツ名（パネル、バッテリー等）
//   part_group カラム = 機種名（7, 11, 12等）
// ナビ順: ブランド > パーツ名 > 機種名
// ============================================================

/**
 * ブランド別のパーツ名一覧（model カラムの distinct 値）
 * PART_GROUP_ORDER の順でソート
 */
export function getDistinctPartNames(
  items: CatalogLatestRow[],
  brand: string
): { partName: string }[] {
  const set = new Set<string>();
  items.filter((r) => r.brand === brand).forEach((r) => set.add(r.model));
  return Array.from(set, (partName) => ({ partName })).sort((a, b) => {
    const oa = partGroupSortKey(a.partName);
    const ob = partGroupSortKey(b.partName);
    if (oa !== ob) return oa - ob;
    return a.partName.localeCompare(b.partName);
  });
}

/**
 * ブランド＋パーツ名でフィルタ（model カラムで絞り込み）
 * part_group（機種名）の発売日順でソート
 */
export function getItemsByBrandAndPartName(
  items: CatalogLatestRow[],
  brand: string,
  partName: string
): PartItem[] {
  return items
    .filter((r) => r.brand === brand && r.model === partName)
    .sort((a, b) => {
      const keyA = getReleaseSortKey(a.part_group ?? "");
      const keyB = getReleaseSortKey(b.part_group ?? "");
      if (keyA !== keyB) return keyA - keyB;
      return (a.part_name ?? "").localeCompare(b.part_name ?? "");
    });
}

/**
 * パーツ名でフィルタしたアイテムを機種名（part_group）ごとにグループ化
 * ブランド別発売日順でソート
 */
export function groupItemsByMachineModel(
  parts: PartItem[],
  brand?: string
): { machineModel: string; items: PartItem[] }[] {
  const map = new Map<string, PartItem[]>();
  for (const p of parts) {
    const g = p.part_group ?? "その他";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(p);
  }
  const keys = Array.from(map.keys());
  const sortedKeys = brand
    ? [...keys].sort((a, b) => {
      const ka = getBrandReleaseSortKey(a, brand);
      const kb = getBrandReleaseSortKey(b, brand);
      return ka !== kb ? ka - kb : a.localeCompare(b);
    })
    : sortModelsByReleaseDate(keys);
  return sortedKeys.map((m) => ({ machineModel: m, items: map.get(m)! }));
}
