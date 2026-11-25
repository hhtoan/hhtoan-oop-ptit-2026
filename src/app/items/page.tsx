import { borrowAction } from "@/app/actions/loans";
import { Notice } from "@/components/Notice";
import { requireReader } from "@/lib/auth";
import { ITEM_STATUS_LABEL } from "@/lib/labels";

/** Độc giả tìm tài liệu và gửi yêu cầu mượn. */
export default async function ItemsPage({ searchParams }: PageProps<"/items">) {
  const reader = await requireReader();
  const params = await searchParams;
  const keyword = typeof params.q === "string" ? params.q : "";
  const items = await reader.searchItems(keyword);

  return (
    <div>
      <h1 className="page-title">Tìm tài liệu</h1>
      <Notice params={params} />
      {reader.isLocked() && (
        <p className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-2 text-yellow-800">
          Tài khoản của bạn đang bị khóa nên không thể mượn tài liệu. Vui lòng liên hệ thủ thư.
        </p>
      )}

      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={keyword} placeholder="Nhập tên, tác giả hoặc thể loại..." className="input" />
        <button className="btn">Tìm</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Tên tài liệu</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.getId()}>
              <td>{item.getTypeName()}</td>
              <td>{item.getTitle()}</td>
              <td>{item.getAuthor()}</td>
              <td>{item.getCategory()}</td>
              <td className={item.isAvailable() ? "text-green-700" : "text-gray-500"}>
                {ITEM_STATUS_LABEL[item.getStatus()]}
              </td>
              <td>
                {item.isAvailable() && (
                  <form action={borrowAction}>
                    <input type="hidden" name="itemId" value={item.getId()} />
                    <input type="hidden" name="q" value={keyword} />
                    <button className="btn">Mượn</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="mt-2 text-sm text-gray-500">Không tìm thấy tài liệu phù hợp.</p>}
    </div>
  );
}
