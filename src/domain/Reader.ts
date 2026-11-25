import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";
import { LoanRepository } from "@/repositories/LoanRepository";
import { UserRole } from "./enums";
import type { LibraryItem } from "./LibraryItem";
import type { Loan } from "./Loan";
import { User } from "./User";

/** Độc giả: kế thừa User, thêm trạng thái khóa và các chức năng tra cứu. */
export class Reader extends User {
  private locked: boolean;

  constructor(id: number, fullName: string, email: string, password: string, locked: boolean = false) {
    super(id, fullName, email, password);
    this.locked = locked;
  }

  override getRole(): UserRole {
    return UserRole.READER;
  }

  isLocked(): boolean {
    return this.locked;
  }

  setLocked(value: boolean): void {
    this.locked = value;
  }

  /** Tìm tài liệu theo tên, tác giả hoặc thể loại (ủy quyền cho repository). */
  searchItems(keyword: string): Promise<LibraryItem[]> {
    return new LibraryItemRepository().search(keyword);
  }

  /** Xem toàn bộ phiếu mượn của chính độc giả này. */
  viewLoanHistory(): Promise<Loan[]> {
    return new LoanRepository().findByReader(this.id);
  }
}
