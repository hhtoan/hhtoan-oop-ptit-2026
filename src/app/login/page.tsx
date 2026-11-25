import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Notice } from "@/components/Notice";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title">Đăng nhập</h1>
      <Notice params={params} />
      <form action={loginAction} className="card space-y-3">
        <label className="block">
          Email
          <input name="email" type="email" required className="input" />
        </label>
        <label className="block">
          Mật khẩu
          <input name="password" type="password" required className="input" />
        </label>
        <button className="btn w-full">Đăng nhập</button>
        <p className="text-sm">
          Chưa có tài khoản? <Link href="/register" className="text-blue-700 underline">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}
