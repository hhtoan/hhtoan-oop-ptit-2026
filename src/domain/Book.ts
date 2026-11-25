import { ItemStatus } from "./enums";
import { ItemType, LibraryItem } from "./LibraryItem";

/** Sách: được mượn 14 ngày, phạt 5.000 đ/ngày trễ. */
export class Book extends LibraryItem {
  static readonly LOAN_DAYS = 14;
  static readonly FINE_PER_DAY = 5000;

  private publisher: string;
  private publishYear: number | null;

  constructor(
    id: number,
    title: string,
    author: string,
    category: string,
    publisher: string,
    publishYear: number | null,
    status: ItemStatus = ItemStatus.AVAILABLE,
  ) {
    super(id, title, author, category, status);
    this.publisher = publisher;
    this.publishYear = publishYear;
  }

  override calculateLoanPeriod(): number {
    return Book.LOAN_DAYS;
  }

  override calculateFine(overdueDays: number): number {
    return Math.max(0, overdueDays) * Book.FINE_PER_DAY;
  }

  override getType(): ItemType {
    return "BOOK";
  }

  override getTypeName(): string {
    return "Sách";
  }

  getPublisher(): string {
    return this.publisher;
  }

  getPublishYear(): number | null {
    return this.publishYear;
  }
}
