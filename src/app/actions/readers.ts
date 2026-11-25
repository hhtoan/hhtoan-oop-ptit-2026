"use server";

import { readNumber, readText, runAndRedirect } from "@/lib/actionResult";
import { requireLibrarian } from "@/lib/auth";
import { UserRepository } from "@/repositories/UserRepository";

/** Thủ thư khóa / mở khóa tài khoản độc giả. */
export async function setReaderLockAction(formData: FormData): Promise<void> {
  const librarian = await requireLibrarian();
  await runAndRedirect("/admin/readers", async () => {
    const reader = await new UserRepository().findReaderById(readNumber(formData, "readerId") ?? 0);
    if (!reader) throw new Error("Không tìm thấy độc giả");

    if (readText(formData, "lock") === "true") {
      await librarian.lockReader(reader);
      return `Đã khóa tài khoản ${reader.getFullName()}`;
    }
    await librarian.unlockReader(reader);
    return `Đã mở khóa tài khoản ${reader.getFullName()}`;
  });
}
