import { setReaderLockAction } from "@/app/actions/readers";
import { Notice } from "@/components/Notice";
import { requireLibrarian } from "@/lib/auth";
import { UserRepository } from "@/repositories/UserRepository";

export default async function AdminReadersPage({ searchParams }: PageProps<"/admin/readers">) {
  await requireLibrarian();
  const params = await searchParams;
  const readers = await new UserRepository().findAllReaders();

  return (
    <div>
      <h1 className="page-title">Quản lý độc giả</h1>
      <Notice params={params} />

      <table className="table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {readers.map((reader) => (
            <tr key={reader.getId()}>
              <td>#{reader.getId()}</td>
              <td>{reader.getFullName()}</td>
              <td>{reader.getEmail()}</td>
              <td className={reader.isLocked() ? "text-red-700" : "text-green-700"}>
                {reader.isLocked() ? "Đã khóa" : "Hoạt động"}
              </td>
              <td>
                <form action={setReaderLockAction}>
                  <input type="hidden" name="readerId" value={reader.getId()} />
                  <input type="hidden" name="lock" value={reader.isLocked() ? "false" : "true"} />
                  <button className={reader.isLocked() ? "btn" : "btn-red"}>
                    {reader.isLocked() ? "Mở khóa" : "Khóa"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
