import { ItemStatus } from "./enums";
import { ItemType, LibraryItem } from "./LibraryItem";

/** Tạp chí: được mượn 7 ngày, phạt 2.000 đ/ngày trễ. */
export class Magazine extends LibraryItem {
  static readonly LOAN_DAYS = 7;
  static readonly FINE_PER_DAY = 2000;

  private issueNumber: number | null;
  private publicationCycle: string;

  constructor(
    id: number,
    title: string,
    author: string,
    category: string,
    issueNumber: number | null,
    publicationCycle: string,
    status: ItemStatus = ItemStatus.AVAILABLE,
  ) {
    super(id, title, author, category, status);
    this.issueNumber = issueNumber;
    this.publicationCycle = publicationCycle;
  }

  override calculateLoanPeriod(): number {
    return Magazine.LOAN_DAYS;
  }

  override calculateFine(overdueDays: number): number {
    return Math.max(0, overdueDays) * Magazine.FINE_PER_DAY;
  }

  override getType(): ItemType {
    return "MAGAZINE";
  }

  override getTypeName(): string {
    return "Tạp chí";
  }

  getIssueNumber(): number | null {
    return this.issueNumber;
  }

  getPublicationCycle(): string {
    return this.publicationCycle;
  }
}
