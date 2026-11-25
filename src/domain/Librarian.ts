import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";
import { LoanRepository } from "@/repositories/LoanRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { LoanManager } from "@/services/LoanManager";
import { ItemStatus, UserRole } from "./enums";
import type { LibraryItem } from "./LibraryItem";
import type { Loan } from "./Loan";
import type { Reader } from "./Reader";
import { User } from "./User";

/** Số liệu thống kê hiển thị cho thủ thư. */
export interface LibraryStatistics {
  totalItems: number;
  borrowedItems: number;
  overdueLoans: Loan[];
}

/** Thủ thư: kế thừa User, có quyền quản lý tài liệu và độc giả. */
export class Librarian extends User {
  override getRole(): UserRole {
    return UserRole.LIBRARIAN;
  }

  addItem(item: LibraryItem): Promise<LibraryItem> {
    return new LibraryItemRepository().create(item);
  }

  updateItem(item: LibraryItem): Promise<void> {
    return new LibraryItemRepository().update(item);
  }

  /** Không cho xóa tài liệu đang có phiếu chờ duyệt / đang mượn. */
  async deleteItem(itemId: number): Promise<void> {
    if (await new LoanRepository().hasActiveLoan(itemId)) {
      throw new Error("Không thể xóa: tài liệu đang có phiếu chờ duyệt hoặc đang được mượn");
    }
    await new LibraryItemRepository().delete(itemId);
  }

  lockReader(reader: Reader): Promise<void> {
    reader.setLocked(true);
    return new UserRepository().updateLocked(reader);
  }

  unlockReader(reader: Reader): Promise<void> {
    reader.setLocked(false);
    return new UserRepository().updateLocked(reader);
  }

  async viewStatistics(): Promise<LibraryStatistics> {
    const itemRepository = new LibraryItemRepository();
    return {
      totalItems: await itemRepository.countAll(),
      borrowedItems: await itemRepository.countByStatus(ItemStatus.BORROWED),
      overdueLoans: await new LoanManager().getOverdueLoans(),
    };
  }
}
