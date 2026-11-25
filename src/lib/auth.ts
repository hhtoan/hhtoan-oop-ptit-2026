import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Librarian } from "@/domain/Librarian";
import { Reader } from "@/domain/Reader";
import type { User } from "@/domain/User";
import { UserRepository } from "@/repositories/UserRepository";

// Đăng nhập đơn giản: sau khi kiểm tra đúng email + mật khẩu,
// lưu id người dùng vào cookie. Mỗi trang đọc cookie để biết ai đang đăng nhập.
const COOKIE_NAME = "userId";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function startSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, String(user.getId()), { httpOnly: true, path: "/", sameSite: "lax" });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Người dùng đang đăng nhập, hoặc null nếu chưa đăng nhập. */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const id = Number(cookieStore.get(COOKIE_NAME)?.value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return new UserRepository().findById(id);
}

/** Bắt buộc đã đăng nhập (vai trò bất kỳ). */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Bắt buộc là độc giả. */
export async function requireReader(): Promise<Reader> {
  const user = await requireUser();
  if (!(user instanceof Reader)) redirect("/");
  return user;
}

/** Bắt buộc là thủ thư. */
export async function requireLibrarian(): Promise<Librarian> {
  const user = await requireUser();
  if (!(user instanceof Librarian)) redirect("/");
  return user;
}
