// Các hàm tiện ích xử lý ngày (chỉ quan tâm ngày, bỏ qua giờ)

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Ngày hôm nay lúc 00:00. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Số ngày từ `from` đến `to` (âm nếu `to` trước `from`). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Định dạng YYYY-MM-DD để ghi xuống cột DATE. */
export function toSqlDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Định dạng dd/mm/yyyy để hiển thị. */
export function formatDate(date: Date | null): string {
  return date ? date.toLocaleDateString("vi-VN") : "—";
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}
