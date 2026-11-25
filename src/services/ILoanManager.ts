import type { LibraryItem } from "@/domain/LibraryItem";
import type { Loan } from "@/domain/Loan";
import type { Reader } from "@/domain/Reader";

/**
 * Interface (trừu tượng) mô tả các nghiệp vụ mượn - trả.
 * Các phương thức trả về Promise vì phải đọc/ghi CSDL.
 */
export interface ILoanManager {
  createLoanRequest(reader: Reader, item: LibraryItem): Promise<Loan>;
  approveLoan(loan: Loan): Promise<void>;
  /** Thêm theo luật nghiệp vụ 2: thủ thư có thể từ chối phiếu. */
  rejectLoan(loan: Loan): Promise<void>;
  returnItem(loan: Loan): Promise<void>;
  getOverdueLoans(): Promise<Loan[]>;
}
