import { ItemStatus } from "./enums";

/** Loại tài liệu, trùng với cột item_type trong CSDL. */
export type ItemType = "BOOK" | "MAGAZINE";

/**
 * Lớp trừu tượng LibraryItem: phần chung của Sách và Tạp chí.
 * Hai phương thức abstract bắt buộc mỗi lớp con tự định nghĩa cách tính
 * thời hạn mượn và tiền phạt → đây là chỗ dùng ĐA HÌNH.
 */
export abstract class LibraryItem {
  protected id: number;
  protected title: string;
  protected author: string;
  protected category: string;
  private status: ItemStatus;

  constructor(
    id: number,
    title: string,
    author: string,
    category: string,
    status: ItemStatus = ItemStatus.AVAILABLE,
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.category = category;
    this.status = status;
  }

  /** Số ngày được mượn. */
  abstract calculateLoanPeriod(): number;

  /** Tiền phạt (VNĐ) khi trả trễ `overdueDays` ngày. */
  abstract calculateFine(overdueDays: number): number;

  /** Loại tài liệu ('BOOK' / 'MAGAZINE'). */
  abstract getType(): ItemType;

  /** Tên loại để hiển thị trên giao diện. */
  abstract getTypeName(): string;

  getId(): number {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getCategory(): string {
    return this.category;
  }

  getStatus(): ItemStatus {
    return this.status;
  }

  setStatus(status: ItemStatus): void {
    this.status = status;
  }

  isAvailable(): boolean {
    return this.status === ItemStatus.AVAILABLE;
  }
}
