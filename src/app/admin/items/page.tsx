import Link from "next/link";
import { deleteItemAction } from "@/app/actions/items";
import { ItemForm, type ItemFormValues } from "@/components/ItemForm";
import { Notice } from "@/components/Notice";
import { Book } from "@/domain/Book";
import type { LibraryItem } from "@/domain/LibraryItem";
import { Magazine } from "@/domain/Magazine";
import { requireLibrarian } from "@/lib/auth";
import { ITEM_STATUS_LABEL } from "@/lib/labels";
import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";

const EMPTY_FORM: ItemFormValues = {
  id: null, type: "BOOK", title: "", author: "", category: "",
  publisher: "", publishYear: "", issueNumber: "", publicationCycle: "",
};

/** Chuyển đối tượng tài liệu thành dữ liệu thô cho form sửa. */
function toFormValues(item: LibraryItem): ItemFormValues {
  const values: ItemFormValues = {
    ...EMPTY_FORM,
    id: item.getId(),
    type: item.getType(),
    title: item.getTitle(),
    author: item.getAuthor(),
    category: item.getCategory(),
  };
  if (item instanceof Book) {
    values.publisher = item.getPublisher();
    values.publishYear = String(item.getPublishYear() ?? "");
  }
  if (item instanceof Magazine) {
    values.issueNumber = String(item.getIssueNumber() ?? "");
    values.publicationCycle = item.getPublicationCycle();
  }
  return values;
}

/** Thông tin riêng của từng loại, hiển thị trong bảng. */
function detailText(item: LibraryItem): string {
  if (item instanceof Book) return `NXB: ${item.getPublisher() || "—"}, năm ${item.getPublishYear() ?? "—"}`;
  if (item instanceof Magazine) return `Số ${item.getIssueNumber() ?? "—"}, ${item.getPublicationCycle() || "—"}`;
  return "";
}

export default async function AdminItemsPage({ searchParams }: PageProps<"/admin/items">) {
  await requireLibrarian();
  const params = await searchParams;
  const repository = new LibraryItemRepository();
  const items = await repository.findAll();

  const editId = Number(params.edit);
  const editing = editId ? await repository.findById(editId) : null;
  const formValues = editing ? toFormValues(editing) : EMPTY_FORM;

  return (
    <div>
      <h1 className="page-title">Quản lý tài liệu</h1>
      <Notice params={params} />

      <ItemForm key={formValues.id ?? "new"} initial={formValues} />

      <h2 className="section-title">Danh sách tài liệu ({items.length})</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Tên tài liệu</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Thông tin thêm</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.getId()}>
                <td>#{item.getId()}</td>
                <td>{item.getTypeName()}</td>
                <td>{item.getTitle()}</td>
                <td>{item.getAuthor()}</td>
                <td>{item.getCategory()}</td>
                <td>{detailText(item)}</td>
                <td>{ITEM_STATUS_LABEL[item.getStatus()]}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/items?edit=${item.getId()}`} className="btn-gray mr-2 inline-block">
                    Sửa
                  </Link>
                  <form action={deleteItemAction} className="inline">
                    <input type="hidden" name="itemId" value={item.getId()} />
                    <button className="btn-red">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
