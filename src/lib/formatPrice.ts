/** 料金表表示用。0円の場合は「店頭見積」を返す（¥0 表示禁止） */
export function formatPrice(yen: number): string {
  if (yen === 0) return "店頭見積";
  return `¥${yen.toLocaleString()}`;
}
