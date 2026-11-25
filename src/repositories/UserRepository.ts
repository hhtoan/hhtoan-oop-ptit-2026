import { UserRole } from "@/domain/enums";
import { Librarian } from "@/domain/Librarian";
import { Reader } from "@/domain/Reader";
import type { User } from "@/domain/User";
import { pool, type Queryable } from "@/lib/db";

/** Một dòng của bảng users. */
interface UserRow {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  is_locked: boolean;
}

/** Đọc/ghi bảng users và chuyển dòng dữ liệu thành đối tượng Reader / Librarian. */
export class UserRepository {
  private db: Queryable;

  constructor(db: Queryable = pool) {
    this.db = db;
  }

  /** Ánh xạ row → object: dựa vào cột role để tạo đúng lớp con. */
  static toUser(row: UserRow): User {
    if (row.role === UserRole.LIBRARIAN) {
      return new Librarian(row.id, row.full_name, row.email, row.password_hash);
    }
    return new Reader(row.id, row.full_name, row.email, row.password_hash, row.is_locked);
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
    return rows.length > 0 ? UserRepository.toUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
    return rows.length > 0 ? UserRepository.toUser(rows[0]) : null;
  }

  async findReaderById(id: number): Promise<Reader | null> {
    const user = await this.findById(id);
    return user instanceof Reader ? user : null;
  }

  async findAllReaders(): Promise<Reader[]> {
    const { rows } = await this.db.query<UserRow>(
      "SELECT * FROM users WHERE role = $1 ORDER BY id",
      [UserRole.READER],
    );
    return rows.map((row) => UserRepository.toUser(row) as Reader);
  }

  /** Tạo tài khoản độc giả mới (mật khẩu truyền vào đã được băm). */
  async createReader(fullName: string, email: string, passwordHash: string): Promise<Reader> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [fullName, email, passwordHash, UserRole.READER],
    );
    return UserRepository.toUser(rows[0]) as Reader;
  }

  async updateProfile(user: User): Promise<void> {
    await this.db.query("UPDATE users SET full_name = $1, email = $2 WHERE id = $3", [
      user.getFullName(),
      user.getEmail(),
      user.getId(),
    ]);
  }

  async updateLocked(reader: Reader): Promise<void> {
    await this.db.query("UPDATE users SET is_locked = $1 WHERE id = $2", [
      reader.isLocked(),
      reader.getId(),
    ]);
  }
}
