import { addDays, daysBetween, today } from "@/lib/date";
import { ItemStatus, LoanStatus } from "./enums";
import type { LibraryItem } from "./LibraryItem";
import type { Reader } from "./Reader";

/**
 * Phiếu mượn. Mọi thay đổi trạng thái phiếu (duyệt, từ chối, trả)
 * đều đi qua phương thức của lớp này → dữ liệu luôn hợp lệ (đóng gói).
 */
export class Loan {
  private id: number;
  private reader: Reader;
  private item: LibraryItem;
  private requestDate: Date;
  private borrowDate: Date | null;
  private dueDate: Date | null;
  private returnDate: Date | null;
  private fineAmount: number;
  private status: LoanStatus;

  constructor(
    id: number,
    reader: Reader,
    item: LibraryItem,
    requestDate: Date,
    borrowDate: Date | null = null,
    dueDate: Date | null = null,
    returnDate: Date | null = null,
    fineAmount: number = 0,
    status: LoanStatus = LoanStatus.PENDING,
  ) {
    this.id = id;
    this.reader = reader;
    this.item = item;
    this.requestDate = requestDate;
    this.borrowDate = borrowDate;
    this.dueDate = dueDate;
    this.returnDate = returnDate;
    this.fineAmount = fineAmount;
    this.status = status;
  }

  /** Quá hạn: đang mượn và hạn trả đã trước hôm nay. */
  isOverdue(): boolean {
    return (
      this.status === LoanStatus.BORROWED &&
      this.dueDate !== null &&
      this.dueDate.getTime() < today().getTime()
    );
  }

  /** Số ngày trễ hạn, tính đến ngày trả (hoặc hôm nay nếu chưa trả). */
  getOverdueDays(): number {
    if (this.dueDate === null) return 0;
    const endDate = this.returnDate ?? today();
    return Math.max(0, daysBetween(this.dueDate, endDate));
  }

  /**
   * Tính tiền phạt. ĐA HÌNH: không cần biết item là Sách hay Tạp chí,
   * chỉ gọi item.calculateFine() và mỗi lớp con tự tính theo cách của mình.
   */
  calculateFine(): number {
    return this.item.calculateFine(this.getOverdueDays());
  }

  /** Thủ thư duyệt phiếu: bắt đầu mượn, tính hạn trả theo loại tài liệu. */
  approve(): void {
    if (this.status !== LoanStatus.PENDING) throw new Error("Chỉ duyệt được phiếu đang chờ duyệt");
    if (!this.item.isAvailable()) throw new Error("Tài liệu hiện không sẵn sàng để cho mượn");

    this.borrowDate = today();
    this.dueDate = addDays(this.borrowDate, this.item.calculateLoanPeriod());
    this.status = LoanStatus.BORROWED;
    this.item.setStatus(ItemStatus.BORROWED);
  }

  /** Thủ thư từ chối phiếu. */
  reject(): void {
    if (this.status !== LoanStatus.PENDING) throw new Error("Chỉ từ chối được phiếu đang chờ duyệt");
    this.status = LoanStatus.REJECTED;
  }

  /** Ghi nhận trả tài liệu: chốt ngày trả, tiền phạt và giải phóng tài liệu. */
  markReturned(): void {
    if (this.status !== LoanStatus.BORROWED) throw new Error("Phiếu này không ở trạng thái đang mượn");

    this.returnDate = today();
    this.fineAmount = this.calculateFine();
    this.status = LoanStatus.RETURNED;
    this.item.setStatus(ItemStatus.AVAILABLE);
  }

  getId(): number {
    return this.id;
  }

  getReader(): Reader {
    return this.reader;
  }

  getItem(): LibraryItem {
    return this.item;
  }

  getRequestDate(): Date {
    return this.requestDate;
  }

  getBorrowDate(): Date | null {
    return this.borrowDate;
  }

  getDueDate(): Date | null {
    return this.dueDate;
  }

  getReturnDate(): Date | null {
    return this.returnDate;
  }

  getFineAmount(): number {
    return this.fineAmount;
  }

  getStatus(): LoanStatus {
    return this.status;
  }
}
