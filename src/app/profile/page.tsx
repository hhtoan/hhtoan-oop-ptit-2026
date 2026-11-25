import { updateProfileAction } from "@/app/actions/auth";
import { Notice } from "@/components/Notice";
import { UserRole } from "@/domain/enums";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const user = await requireUser();
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title">Hồ sơ cá nhân</h1>
      <Notice params={params} />
      <form action={updateProfileAction} className="card space-y-3">
        <p className="text-sm text-gray-600">
          Vai trò: {user.getRole() === UserRole.LIBRARIAN ? "Thủ thư" : "Độc giả"}
        </p>
        <label className="block">
          Họ tên
          <input name="fullName" required defaultValue={user.getFullName()} className="input" />
        </label>
        <label className="block">
          Email
          <input name="email" type="email" required defaultValue={user.getEmail()} className="input" />
        </label>
        <button className="btn w-full">Lưu thay đổi</button>
      </form>
    </div>
  );
}
