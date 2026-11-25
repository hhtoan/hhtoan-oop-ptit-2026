import { redirect } from "next/navigation";

/**
 * Chạy một thao tác rồi quay lại trang `path`, kèm thông báo trên URL:
 * - thành công: ?message=...
 * - có lỗi:     ?error=...  (quay về `errorPath` nếu có)
 */
export async function runAndRedirect(
  path: string,
  work: () => Promise<string>,
  errorPath: string = path,
): Promise<never> {
  let target: string;
  try {
    const message = await work();
    target = withQuery(path, "message", message);
  } catch (error) {
    const text = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
    target = withQuery(errorPath, "error", text);
  }
  redirect(target);
}

function withQuery(path: string, key: string, value: string): string {
  return path + (path.includes("?") ? "&" : "?") + key + "=" + encodeURIComponent(value);
}

/** Đọc một trường chuỗi trong form. */
export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Đọc một trường số trong form (rỗng → null). */
export function readNumber(formData: FormData, name: string): number | null {
  const text = readText(formData, name);
  if (text === "") return null;
  const value = Number(text);
  if (!Number.isInteger(value)) throw new Error(`Giá trị "${name}" phải là số nguyên`);
  return value;
}
