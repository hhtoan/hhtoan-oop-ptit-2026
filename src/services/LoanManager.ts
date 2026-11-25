import { Loan } from "@/domain/Loan";
import type { LibraryItem } from "@/domain/LibraryItem";
import type { Reader } from "@/domain/Reader";
import { today } from "@/lib/date";
import { withTransaction } from "@/lib/db";
import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";
import { LoanRepository } from "@/repositories/LoanRepository";
import type { ILoanManager } from "./ILoanManager";

/**
 * Cài đặt interface ILoanManager.
 * - Kiểm tra luật nghiệp vụ.
 * - Gọi phương thức của Loan để đổi trạng thái.
 * - Gọi repository để lưu xuống CSDL.
 */
export class LoanManager implements ILoanManager {
  private loanRepository = new LoanRepository();

  /** Luật 1: tạo phiếu PENDING nếu độc giả không bị khóa và tài liệu còn trống. */
  async createLoanRequest(reader: Reader, item: LibraryItem): Promise<Loan> {
    if (reader.isLocked()) {
      throw new Error("Tài khoản của bạn đang bị khóa, không thể mượn tài liệu");
    }
    if (!item.isAvailable()) {
      throw new Error("Tài liệu đang được mượn");
    }
    if (await this.loanRepository.hasActiveLoan(item.getId())) {
      throw new Error("Tài liệu đã có người đăng ký mượn, đang chờ duyệt");
    }
    const loan = new Loan(0, reader, item, today());
    return this.loanRepository.create(loan);
  }

  /** Luật 2: duyệt phiếu, phiếu và tài liệu cùng chuyển BORROWED. */
  async approveLoan(loan: Loan): Promise<void> {
    loan.approve();
    await this.saveLoanAndItem(loan);
  }

  /** Luật 2: từ chối phiếu, phiếu chuyển REJECTED. */
  async rejectLoan(loan: Loan): Promise<void> {
    loan.reject();
    await this.loanRepository.update(loan);
  }

  /** Luật 3: ghi nhận trả, tính tiền phạt, tài liệu về AVAILABLE. */
  async returnItem(loan: Loan): Promise<void> {
    loan.markReturned();
    await this.saveLoanAndItem(loan);
  }

  /** Luật 4: phiếu BORROWED có hạn trả trước hôm nay. */
  getOverdueLoans(): Promise<Loan[]> {
    return this.loanRepository.findOverdue(today());
  }

  /** Lưu phiếu và trạng thái tài liệu trong cùng 1 transaction. */
  private async saveLoanAndItem(loan: Loan): Promise<void> {
    await withTransaction(async (client) => {
      await new LoanRepository(client).update(loan);
      await new LibraryItemRepository(client).updateStatus(loan.getItem());
    });
  }
}
