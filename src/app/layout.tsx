import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Librarian } from "@/domain/Librarian";
import { Reader } from "@/domain/Reader";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thư viện trực tuyến",
  description: "Hệ thống quản lý thư viện trực tuyến - Bài tập lớn OOP",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 p-4 text-sm">
            <Link href="/" className="text-base font-bold text-blue-700">
              📚 Thư viện trực tuyến
            </Link>

            {user instanceof Reader && (
              <>
                <Link href="/items">Tìm tài liệu</Link>
                <Link href="/my-loans">Phiếu mượn của tôi</Link>
              </>
            )}

            {user instanceof Librarian && (
              <>
                <Link href="/admin/items">Tài liệu</Link>
                <Link href="/admin/loans">Phiếu mượn</Link>
                <Link href="/admin/readers">Độc giả</Link>
                <Link href="/admin/stats">Thống kê</Link>
              </>
            )}

            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/profile">👤 {user.getFullName()}</Link>
                  <form action={logoutAction}>
                    <button className="btn-gray">Đăng xuất</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Đăng nhập</Link>
                  <Link href="/register">Đăng ký</Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
