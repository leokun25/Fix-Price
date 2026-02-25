/** パーツ名（part_group）の表示優先順。ブランド＞パーツ名＞機種名の「パーツ名」タイル・一覧で共通利用 */
export const PART_GROUP_ORDER = [
  "パネル",
  "バッテリー",
  "充電コネクタ",
  "Rカメラ",
  "Fカメラ",
  "PBケーブル",
  "VLケーブル",
  "PVケーブル",
  "近接センサー",
  "イヤスピーカー",
  "ラウドスピーカー",
  "ホームボタン",
  "バックパネル",
];

/** 表記ゆれ・別名 → PART_GROUP_ORDER のインデックス（例: paneru → パネル。パネルS等は prefix パネルでマッチ） */
const PART_GROUP_ALIASES: [string | RegExp, number][] = [
  [/^paneru/i, 0],
];

/** 長いラベルを先にマッチさせるため（例: バックパネル before パネル） */
const PART_GROUP_ORDER_BY_LENGTH = [...PART_GROUP_ORDER].sort(
  (a, b) => b.length - a.length
);

export function partGroupSortKey(label: string | null): number {
  const s = label ?? "";
  const exact = PART_GROUP_ORDER.indexOf(s);
  if (exact >= 0) return exact;
  for (const [alias, orderIndex] of PART_GROUP_ALIASES) {
    if (typeof alias === "string" ? s === alias || s.startsWith(alias) : alias.test(s)) return orderIndex;
  }
  for (let i = 0; i < PART_GROUP_ORDER_BY_LENGTH.length; i++) {
    const prefix = PART_GROUP_ORDER_BY_LENGTH[i];
    const orderIndex = PART_GROUP_ORDER.indexOf(prefix);
    if (s === prefix || s.startsWith(prefix + " ") || s.startsWith(prefix + ">") || s.startsWith(prefix + "＞") || s.startsWith(prefix)) return orderIndex;
  }
  return PART_GROUP_ORDER.length;
}
