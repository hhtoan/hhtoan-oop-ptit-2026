import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Notice } from "@/components/Notice";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title">Đăng ký tài khoản độc giả</h1>
      <Notice params={params} />
      <form action={registerAction} className="card space-y-3">
        <label className="block">
          Họ tên
          <input name="fullName" required className="input" />
        </label>
        <label className="block">
          Email
          <input name="email" type="email" required className="input" />
        </label>
        <label className="block">
          Mật khẩu (ít nhất 6 ký tự)
          <input name="password" type="password" required minLength={6} className="input" />
        </label>
        <button className="btn w-full">Đăng ký</button>
        <p className="text-sm">
          Đã có tài khoản? <Link href="/login" className="text-blue-700 underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
