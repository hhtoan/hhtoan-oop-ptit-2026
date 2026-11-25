"use server";

import { Book } from "@/domain/Book";
import type { LibraryItem } from "@/domain/LibraryItem";
import { Magazine } from "@/domain/Magazine";
import { readNumber, readText, runAndRedirect } from "@/lib/actionResult";
import { requireLibrarian } from "@/lib/auth";
import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";

/** Tạo đối tượng Book / Magazine từ dữ liệu form. */
function buildItem(type: string, id: number, formData: FormData): LibraryItem {
  const title = readText(formData, "title");
  const author = readText(formData, "author");
  const category = readText(formData, "category");
  if (title === "" || author === "" || category === "") {
    throw new Error("Vui lòng nhập đủ tên, tác giả và thể loại");
  }

  if (type === "BOOK") {
    return new Book(id, title, author, category,
      readText(formData, "publisher"), readNumber(formData, "publishYear"));
  }
  if (type === "MAGAZINE") {
    return new Magazine(id, title, author, category,
      readNumber(formData, "issueNumber"), readText(formData, "publicationCycle"));
  }
  throw new Error("Loại tài liệu không hợp lệ");
}

/** Thêm mới (không có id) hoặc cập nhật (có id) tài liệu. */
export async function saveItemAction(formData: FormData): Promise<void> {
  const librarian = await requireLibrarian();
  const id = Number(readText(formData, "id")) || 0;
  const errorPath = id ? `/admin/items?edit=${id}` : "/admin/items";

  await runAndRedirect("/admin/items", async () => {
    if (id === 0) {
      const item = await librarian.addItem(buildItem(readText(formData, "type"), 0, formData));
      return `Đã thêm "${item.getTitle()}"`;
    }
    const existing = await new LibraryItemRepository().findById(id);
    if (!existing) throw new Error("Không tìm thấy tài liệu");
    // Khi sửa: giữ nguyên loại tài liệu ban đầu
    const item = buildItem(existing.getType(), id, formData);
    await librarian.updateItem(item);
    return `Đã cập nhật "${item.getTitle()}"`;
  }, errorPath);
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  const librarian = await requireLibrarian();
  await runAndRedirect("/admin/items", async () => {
    await librarian.deleteItem(readNumber(formData, "itemId") ?? 0);
    return "Đã xóa tài liệu";
  });
}
