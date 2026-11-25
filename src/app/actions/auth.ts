"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readText, runAndRedirect } from "@/lib/actionResult";
import { endSession, hashPassword, requireUser, startSession } from "@/lib/auth";
import { UserRepository } from "@/repositories/UserRepository";

function failTo(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Đăng nhập: tìm user theo email rồi để chính đối tượng User kiểm tra mật khẩu. */
export async function loginAction(formData: FormData): Promise<void> {
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  const user = await new UserRepository().findByEmail(email);
  if (!user || !user.login(email, password)) {
    failTo("/login", "Sai email hoặc mật khẩu");
  }
  await startSession(user);
  redirect("/");
}

/** Đăng ký: chỉ tạo được tài khoản độc giả. */
export async function registerAction(formData: FormData): Promise<void> {
  const fullName = readText(formData, "fullName");
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (fullName === "" || email === "") failTo("/register", "Vui lòng nhập đủ họ tên và email");
  if (!email.includes("@")) failTo("/register", "Email không hợp lệ");
  if (password.length < 6) failTo("/register", "Mật khẩu phải có ít nhất 6 ký tự");

  const repository = new UserRepository();
  if (await repository.findByEmail(email)) failTo("/register", "Email đã được sử dụng");

  const reader = await repository.createReader(fullName, email, hashPassword(password));
  await startSession(reader);
  redirect("/items");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}

/** Cập nhật hồ sơ: User.updateProfile() kiểm tra dữ liệu, repository lưu xuống CSDL. */
export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await runAndRedirect("/profile", async () => {
    const fullName = readText(formData, "fullName");
    const email = readText(formData, "email");
    const repository = new UserRepository();

    const owner = await repository.findByEmail(email);
    if (owner && owner.getId() !== user.getId()) throw new Error("Email đã được sử dụng");

    user.updateProfile(fullName, email);
    await repository.updateProfile(user);
    revalidatePath("/", "layout"); // làm mới thanh menu (hiển thị tên mới)
    return "Đã cập nhật hồ sơ";
  });
}
