"use client";

import Link from "next/link";
import { useState } from "react";
import { saveItemAction } from "@/app/actions/items";
import type { ItemType } from "@/domain/LibraryItem";

/** Dữ liệu thô để điền sẵn vào form (không truyền object class sang client). */
export interface ItemFormValues {
  id: number | null;
  type: ItemType;
  title: string;
  author: string;
  category: string;
  publisher: string;
  publishYear: string;
  issueNumber: string;
  publicationCycle: string;
}

/** Form thêm / sửa tài liệu: các trường riêng đổi theo loại Sách / Tạp chí. */
export function ItemForm({ initial }: { initial: ItemFormValues }) {
  const [type, setType] = useState<ItemType>(initial.type);
  const isEdit = initial.id !== null;

  return (
    <form action={saveItemAction} className="card grid gap-3 sm:grid-cols-2">
      <h2 className="font-semibold sm:col-span-2">
        {isEdit ? `Sửa tài liệu #${initial.id}` : "Thêm tài liệu mới"}
      </h2>
      {isEdit && <input type="hidden" name="id" value={initial.id ?? ""} />}

      <label>
        Loại tài liệu
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ItemType)}
          disabled={isEdit}
          className="input"
        >
          <option value="BOOK">Sách</option>
          <option value="MAGAZINE">Tạp chí</option>
        </select>
      </label>
      <label>
        Tên tài liệu
        <input name="title" required defaultValue={initial.title} className="input" />
      </label>
      <label>
        Tác giả
        <input name="author" required defaultValue={initial.author} className="input" />
      </label>
      <label>
        Thể loại
        <input name="category" required defaultValue={initial.category} className="input" />
      </label>

      {type === "BOOK" ? (
        <>
          <label>
            Nhà xuất bản
            <input name="publisher" defaultValue={initial.publisher} className="input" />
          </label>
          <label>
            Năm xuất bản
            <input name="publishYear" type="number" defaultValue={initial.publishYear} className="input" />
          </label>
        </>
      ) : (
        <>
          <label>
            Số phát hành
            <input name="issueNumber" type="number" defaultValue={initial.issueNumber} className="input" />
          </label>
          <label>
            Định kỳ phát hành
            <input
              name="publicationCycle"
              placeholder="Hàng tuần, hàng tháng..."
              defaultValue={initial.publicationCycle}
              className="input"
            />
          </label>
        </>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <button className="btn">{isEdit ? "Lưu thay đổi" : "Thêm tài liệu"}</button>
        {isEdit && (
          <Link href="/admin/items" className="btn-gray">
            Hủy
          </Link>
        )}
      </div>
    </form>
  );
}
