import { LoanStatus } from "@/domain/enums";
import { Loan } from "@/domain/Loan";
import { Reader } from "@/domain/Reader";
import { toSqlDate } from "@/lib/date";
import { pool, type Queryable } from "@/lib/db";
import { LibraryItemRepository } from "./LibraryItemRepository";

/** Một dòng loans JOIN users JOIN library_items (+ bảng con). */
interface LoanRow {
  id: number;
  request_date: Date;
  borrow_date: Date | null;
  due_date: Date | null;
  return_date: Date | null;
  fine_amount: string; // NUMERIC được pg trả về dạng chuỗi
  status: string;
  reader_id: number;
  reader_name: string;
  reader_email: string;
  reader_password: string;
  reader_locked: boolean;
  item_id: number;
  title: string;
  author: string;
  category: string;
  item_type: string;
  item_status: string;
  publisher: string | null;
  publish_year: number | null;
  issue_number: number | null;
  publication_cycle: string | null;
}

const SELECT_LOANS = `
  SELECT l.id, l.request_date, l.borrow_date, l.due_date, l.return_date, l.fine_amount, l.status,
         u.id AS reader_id, u.full_name AS reader_name, u.email AS reader_email,
         u.password_hash AS reader_password, u.is_locked AS reader_locked,
         li.id AS item_id, li.title, li.author, li.category, li.item_type, li.status AS item_status,
         b.publisher, b.publish_year, m.issue_number, m.publication_cycle
  FROM loans l
  JOIN users u ON u.id = l.reader_id
  JOIN library_items li ON li.id = l.item_id
  LEFT JOIN books b ON b.item_id = li.id
  LEFT JOIN magazines m ON m.item_id = li.id`;

/** Đọc/ghi bảng loans, ánh xạ mỗi dòng thành đối tượng Loan (kèm Reader và LibraryItem). */
export class LoanRepository {
  private db: Queryable;

  constructor(db: Queryable = pool) {
    this.db = db;
  }

  private static toLoan(row: LoanRow): Loan {
    const reader = new Reader(row.reader_id, row.reader_name, row.reader_email,
      row.reader_password, row.reader_locked);
    const item = LibraryItemRepository.toItem({
      id: row.item_id,
      title: row.title,
      author: row.author,
      category: row.category,
      item_type: row.item_type,
      status: row.item_status,
      publisher: row.publisher,
      publish_year: row.publish_year,
      issue_number: row.issue_number,
      publication_cycle: row.publication_cycle,
    });
    return new Loan(row.id, reader, item, row.request_date, row.borrow_date, row.due_date,
      row.return_date, Number(row.fine_amount), row.status as LoanStatus);
  }

  async findById(id: number): Promise<Loan | null> {
    const { rows } = await this.db.query<LoanRow>(`${SELECT_LOANS} WHERE l.id = $1`, [id]);
    return rows.length > 0 ? LoanRepository.toLoan(rows[0]) : null;
  }

  async findByReader(readerId: number): Promise<Loan[]> {
    const { rows } = await this.db.query<LoanRow>(
      `${SELECT_LOANS} WHERE l.reader_id = $1 ORDER BY l.id DESC`,
      [readerId],
    );
    return rows.map(LoanRepository.toLoan);
  }

  async findByStatus(status: LoanStatus): Promise<Loan[]> {
    const { rows } = await this.db.query<LoanRow>(
      `${SELECT_LOANS} WHERE l.status = $1 ORDER BY l.id`,
      [status],
    );
    return rows.map(LoanRepository.toLoan);
  }

  /** Phiếu đang mượn có hạn trả trước ngày `date`. */
  async findOverdue(date: Date): Promise<Loan[]> {
    const { rows } = await this.db.query<LoanRow>(
      `${SELECT_LOANS} WHERE l.status = $1 AND l.due_date < $2 ORDER BY l.due_date`,
      [LoanStatus.BORROWED, toSqlDate(date)],
    );
    return rows.map(LoanRepository.toLoan);
  }

  /** Tài liệu đã có phiếu PENDING hoặc BORROWED chưa? */
  async hasActiveLoan(itemId: number): Promise<boolean> {
    const { rows } = await this.db.query(
      "SELECT 1 FROM loans WHERE item_id = $1 AND status IN ($2, $3) LIMIT 1",
      [itemId, LoanStatus.PENDING, LoanStatus.BORROWED],
    );
    return rows.length > 0;
  }

  async create(loan: Loan): Promise<Loan> {
    const { rows } = await this.db.query<{ id: number }>(
      `INSERT INTO loans (reader_id, item_id, request_date, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [loan.getReader().getId(), loan.getItem().getId(), toSqlDate(loan.getRequestDate()), loan.getStatus()],
    );
    const created = await this.findById(rows[0].id);
    if (!created) throw new Error("Không tạo được phiếu mượn");
    return created;
  }

  async update(loan: Loan): Promise<void> {
    const borrowDate = loan.getBorrowDate();
    const dueDate = loan.getDueDate();
    const returnDate = loan.getReturnDate();
    await this.db.query(
      `UPDATE loans
       SET borrow_date = $1, due_date = $2, return_date = $3, fine_amount = $4, status = $5
       WHERE id = $6`,
      [
        borrowDate ? toSqlDate(borrowDate) : null,
        dueDate ? toSqlDate(dueDate) : null,
        returnDate ? toSqlDate(returnDate) : null,
        loan.getFineAmount(),
        loan.getStatus(),
        loan.getId(),
      ],
    );
  }
}
