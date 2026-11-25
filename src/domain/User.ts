import bcrypt from "bcryptjs";
import { UserRole } from "./enums";

/**
 * Lớp trừu tượng User: phần chung của Độc giả và Thủ thư.
 * - id, fullName, email: protected → lớp con dùng được, bên ngoài không truy cập trực tiếp.
 * - password: private → chỉ chính lớp User biết (đây là mật khẩu đã băm).
 */
export abstract class User {
  protected id: number;
  protected fullName: string;
  protected email: string;
  private password: string;

  constructor(id: number, fullName: string, email: string, password: string) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
  }

  /** Mỗi lớp con tự cho biết vai trò của mình. */
  abstract getRole(): UserRole;

  getId(): number {
    return this.id;
  }

  getFullName(): string {
    return this.fullName;
  }

  getEmail(): string {
    return this.email;
  }

  /** Đăng nhập: đúng email và đúng mật khẩu thì trả về true. */
  login(email: string, password: string): boolean {
    return this.email === email && bcrypt.compareSync(password, this.password);
  }

  /** Cập nhật hồ sơ, có kiểm tra dữ liệu hợp lệ trước khi gán. */
  updateProfile(fullName: string, email: string): void {
    if (fullName.trim() === "") throw new Error("Họ tên không được để trống");
    if (!email.includes("@")) throw new Error("Email không hợp lệ");
    this.fullName = fullName.trim();
    this.email = email.trim();
  }
}
