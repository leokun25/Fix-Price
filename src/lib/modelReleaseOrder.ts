/**
 * 機種名を発売日順でソートするためのユーティリティ。
 * RELEASE_YYYYMM に直接エントリーがある場合はそれを使用。
 * ない場合は世代番号×1000 + 種別ランクで近似。
 *
 * ブランドによって同じ番号（例: iPad "4" と iPhone "4"）が競合するため、
 * getBrandReleaseSortKey でブランド別テーブルを参照する。
 */

// ---- iPhone ----------------------------------------------------------------
const IPHONE_RELEASE: Record<string, number> = {
  // 古い世代
  "4": 201006,
  "4s": 201110,
  "5": 201209,
  "5c": 201309,
  "5s": 201309,
  // SE
  "se": 201603,
  "se2": 202004,
  "se3": 202203,
  // iPhone 6 系
  "6": 201409,
  "6plus": 201409,
  "6s": 201509,
  "6splus": 201509,
  // iPhone 7 系
  "7": 201609,
  "7p": 201609,
  "7plus": 201609,
  // iPhone 8 系
  "8": 201709,
  "8p": 201709,
  "8plus": 201709,
  // iPhone X 系
  "x": 201711,
  "xs": 201809,
  "xsmax": 201809,
  "xr": 201810,
  // iPhone 11 系
  "11": 201909,
  "11pro": 201909,
  "11promax": 201909,
  // iPhone 12 系
  "12": 202010,
  "12pro": 202010,
  "12mini": 202011,
  "12promax": 202011,
  // iPhone 13 系
  "13": 202109,
  "13pro": 202109,
  "13mini": 202109,
  "13promax": 202109,
  // iPhone 14 系
  "14": 202209,
  "14pro": 202209,
  "14plus": 202210,
  "14promax": 202209,
  // iPhone 15 系
  "15": 202309,
  "15pro": 202309,
  "15plus": 202309,
  "15promax": 202309,
  // iPhone 16 系
  "16": 202409,
  "16pro": 202409,
  "16plus": 202409,
  "16promax": 202409,
};

// ---- iPad ------------------------------------------------------------------
const IPAD_RELEASE: Record<string, number> = {
  "2": 201103,
  "3": 201203,
  "4": 201211,
  "5": 201703,
  "6": 201803,
  "7": 201909,
  "8": 202009,
  "9": 202109,
  "10": 202210,
  // Air
  "air": 201311,
  "air 2": 201410,
  "air 3": 201903,
  "air 4": 202010,
  "air 5": 202203,
  "air 6": 202405,
  // mini
  "mini": 201211,
  "mini 1": 201211,
  "mini 2": 201311,
  "mini 3": 201410,
  "mini 4": 201509,
  "mini 5": 201903,
  "mini 6": 202109,
  // Pro
  "pro 9.7": 201603,
  "pro 10.5": 201706,
  "pro 11": 201811,
  "pro 12.9": 201511,
  "pro 13": 202405,
};

// ---- Galaxy ----------------------------------------------------------------
const GALAXY_RELEASE: Record<string, number> = {
  // S series
  "s 2": 201105, "s 3": 201205, "s4": 201404,
  "s5": 201404, "s6": 201504, "s7": 201603,
  "s8": 201704, "s9": 201803, "s10": 201903,
  "s20": 202002, "s21": 202101, "s22": 202202,
  "s23": 202302, "s24": 202401,
  // Note series
  "note": 201109, "note 2": 201210, "note3": 201309,
  "note4": 201410, "note8": 201708, "note9": 201808,
  "note10": 201908, "note20": 202008,
  // A series
  "a3": 201501, "a7": 201601, "a8": 201808,
  "a20": 201904, "a21": 202008, "a30": 201904,
  "a41": 202004, "a51": 202001, "a52": 202104,
  "a53": 202204, "a54": 202304,
  // Z series
  "z flip": 202002, "z fold": 202009,
};

// ---- Xperia ----------------------------------------------------------------
const XPERIA_RELEASE: Record<string, number> = {
  "z": 201302, "z1": 201309, "z2": 201403, "z3": 201410,
  "z4": 201504, "z5": 201510,
  "x": 201607, "xz": 201610, "xz1": 201709, "xz2": 201803, "xz3": 201810,
  "1": 201905, "1 ii": 202006, "1 iii": 202107, "1 iv": 202207, "1 v": 202305,
  "5": 201910, "5 ii": 202011, "5 iii": 202109, "5 iv": 202210, "5 v": 202310,
  "10": 201905, "10 ii": 202006, "10 iii": 202107, "10 iv": 202207, "10 v": 202306,
};

// ---- Pixel -----------------------------------------------------------------
const PIXEL_RELEASE: Record<string, number> = {
  "3": 201810, "3a": 201905,
  "4": 201910, "4a": 202008,
  "5": 202010, "5a": 202108,
  "6": 202110, "6a": 202207, "6 pro": 202110,
  "7": 202210, "7a": 202305, "7 pro": 202210,
  "8": 202310, "8a": 202405, "8 pro": 202310,
};

// ---- HUAWEI ----------------------------------------------------------------
const HUAWEI_RELEASE: Record<string, number> = {
  "p8": 201504, "p9": 201604, "p10": 201702, "p20": 201803,
  "p30": 201903, "p40": 202003,
  "mate9": 201611, "mate10": 201710, "mate20": 201810,
  "mate30": 201909, "mate40": 202010,
  "nova": 201609, "nova 2": 201706, "nova 3": 201807,
  "nova 5t": 201909, "nova lite 2": 201710, "nova lite 3": 201901,
  "honor8": 201607, "honor9": 201706, "honor10": 201804,
};

// ============================================================
// ユーティリティ
// ============================================================
function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/pro max/g, "promax")
    .replace(/[　]/g, " ")
    .trim();
}

function extractGeneration(model: string): number {
  const m = model.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

/** テーブルを引く（"/" 区切りは先頭セグメントを使用） */
function tableKey(
  model: string,
  table: Record<string, number>
): number | null {
  const key = normalizeKey(model);
  if (table[key] != null) return table[key];
  if (key.includes("/")) {
    for (const seg of key.split("/")) {
      const s = seg.trim();
      if (table[s] != null) return table[s];
    }
  }
  // 前方一致（部分名 → テーブル検索）
  for (const [name, val] of Object.entries(table)) {
    if (key === name || key.startsWith(name + " ") || name.startsWith(key + " ")) {
      return val;
    }
  }
  return null;
}

/**
 * ブランド別の発売日ソートキー（小さいほど古い）
 */
export function getBrandReleaseSortKey(model: string, brand: string): number {
  const b = brand.toLowerCase();
  let table: Record<string, number> | null = null;
  if (b.includes("iphone")) table = IPHONE_RELEASE;
  else if (b.includes("ipad")) table = IPAD_RELEASE;
  else if (b.includes("galaxy")) table = GALAXY_RELEASE;
  else if (b.includes("xperia")) table = XPERIA_RELEASE;
  else if (b.includes("pixel")) table = PIXEL_RELEASE;
  else if (b.includes("huawei")) table = HUAWEI_RELEASE;

  if (table) {
    const v = tableKey(model, table);
    if (v != null) return v;
  }
  // フォールバック: 世代番号 × 1000 + 種別ランク
  const gen = extractGeneration(model);
  return gen > 0 ? gen * 1000 : 9_000_000;
}

// ---- 後方互換（既存コードから参照されている） ----------------------------

/**
 * @deprecated getBrandReleaseSortKey を使うこと
 */
export function getReleaseSortKey(model: string): number {
  return getBrandReleaseSortKey(model, "iPhone");
}

export function sortModelsByReleaseDate(models: string[]): string[] {
  return [...models].sort((a, b) => {
    const ka = getReleaseSortKey(a);
    const kb = getReleaseSortKey(b);
    return ka !== kb ? ka - kb : a.localeCompare(b);
  });
}

export function getModelGroupKey(model: string): string {
  const gen = extractGeneration(model);
  const lower = model.toLowerCase();
  if (gen === 0) return model.trim() || "other";
  if (lower.includes("mini")) return `${gen}mini`;
  if (lower.includes("plus")) return `${gen}Plus`;
  if (lower.includes("promax") || lower.includes("pro max")) return `${gen}ProMax`;
  return String(gen);
}
