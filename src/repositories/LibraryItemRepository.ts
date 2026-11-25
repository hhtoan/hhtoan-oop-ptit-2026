import { Book } from "@/domain/Book";
import { ItemStatus } from "@/domain/enums";
import type { LibraryItem } from "@/domain/LibraryItem";
import { Magazine } from "@/domain/Magazine";
import { pool, withTransaction, type Queryable } from "@/lib/db";

/** Một dòng library_items kèm cột của bảng con books / magazines (LEFT JOIN). */
export interface ItemRow {
  id: number;
  title: string;
  author: string;
  category: string;
  item_type: string;
  status: string;
  publisher: string | null;
  publish_year: number | null;
  issue_number: number | null;
  publication_cycle: string | null;
}

const SELECT_ITEMS = `
  SELECT li.id, li.title, li.author, li.category, li.item_type, li.status,
         b.publisher, b.publish_year, m.issue_number, m.publication_cycle
  FROM library_items li
  LEFT JOIN books b ON b.item_id = li.id
  LEFT JOIN magazines m ON m.item_id = li.id`;

/** Đọc/ghi bảng library_items + books + magazines. */
export class LibraryItemRepository {
  private db: Queryable;

  constructor(db: Queryable = pool) {
    this.db = db;
  }

  /** FACTORY: dựa vào item_type để tạo đúng đối tượng Book hoặc Magazine. */
  static toItem(row: ItemRow): LibraryItem {
    const status = row.status as ItemStatus;
    if (row.item_type === "BOOK") {
      return new Book(row.id, row.title, row.author, row.category,
        row.publisher ?? "", row.publish_year, status);
    }
    if (row.item_type === "MAGAZINE") {
      return new Magazine(row.id, row.title, row.author, row.category,
        row.issue_number, row.publication_cycle ?? "", status);
    }
    throw new Error(`Loại tài liệu không hợp lệ: ${row.item_type}`);
  }

  async findAll(): Promise<LibraryItem[]> {
    const { rows } = await this.db.query<ItemRow>(`${SELECT_ITEMS} ORDER BY li.id`);
    return rows.map(LibraryItemRepository.toItem);
  }

  async findById(id: number): Promise<LibraryItem | null> {
    const { rows } = await this.db.query<ItemRow>(`${SELECT_ITEMS} WHERE li.id = $1`, [id]);
    return rows.length > 0 ? LibraryItemRepository.toItem(rows[0]) : null;
  }

  /** Tìm theo tên, tác giả hoặc thể loại (không phân biệt hoa thường). */
  async search(keyword: string): Promise<LibraryItem[]> {
    const { rows } = await this.db.query<ItemRow>(
      `${SELECT_ITEMS}
       WHERE li.title ILIKE $1 OR li.author ILIKE $1 OR li.category ILIKE $1
       ORDER BY li.id`,
      [`%${keyword.trim()}%`],
    );
    return rows.map(LibraryItemRepository.toItem);
  }

  /** Thêm tài liệu: ghi library_items và bảng con trong cùng 1 transaction. */
  async create(item: LibraryItem): Promise<LibraryItem> {
    const newId = await withTransaction(async (client) => {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO library_items (title, author, category, item_type, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [item.getTitle(), item.getAuthor(), item.getCategory(), item.getType(), item.getStatus()],
      );
      await this.saveDetails(client, rows[0].id, item, true);
      return rows[0].id;
    });
    const created = await this.findById(newId);
    if (!created) throw new Error("Không tạo được tài liệu");
    return created;
  }

  /** Sửa thông tin tài liệu (không đổi loại, không đổi trạng thái). */
  async update(item: LibraryItem): Promise<void> {
    await withTransaction(async (client) => {
      await client.query(
        "UPDATE library_items SET title = $1, author = $2, category = $3 WHERE id = $4",
        [item.getTitle(), item.getAuthor(), item.getCategory(), item.getId()],
      );
      await this.saveDetails(client, item.getId(), item, false);
    });
  }

  /** Xóa tài liệu: xóa bảng con rồi tới library_items trong cùng 1 transaction. */
  async delete(id: number): Promise<void> {
    await withTransaction(async (client) => {
      await client.query("DELETE FROM books WHERE item_id = $1", [id]);
      await client.query("DELETE FROM magazines WHERE item_id = $1", [id]);
      await client.query("DELETE FROM library_items WHERE id = $1", [id]);
    });
  }

  async updateStatus(item: LibraryItem): Promise<void> {
    await this.db.query("UPDATE library_items SET status = $1 WHERE id = $2", [
      item.getStatus(),
      item.getId(),
    ]);
  }

  async countAll(): Promise<number> {
    const { rows } = await this.db.query<{ count: string }>("SELECT COUNT(*) FROM library_items");
    return Number(rows[0].count);
  }

  async countByStatus(status: ItemStatus): Promise<number> {
    const { rows } = await this.db.query<{ count: string }>(
      "SELECT COUNT(*) FROM library_items WHERE status = $1",
      [status],
    );
    return Number(rows[0].count);
  }

  /** Ghi phần thông tin riêng vào bảng con books hoặc magazines. */
  private async saveDetails(db: Queryable, itemId: number, item: LibraryItem, isNew: boolean): Promise<void> {
    if (item instanceof Book) {
      await db.query(
        isNew
          ? "INSERT INTO books (publisher, publish_year, item_id) VALUES ($1, $2, $3)"
          : "UPDATE books SET publisher = $1, publish_year = $2 WHERE item_id = $3",
        [item.getPublisher(), item.getPublishYear(), itemId],
      );
    } else if (item instanceof Magazine) {
      await db.query(
        isNew
          ? "INSERT INTO magazines (issue_number, publication_cycle, item_id) VALUES ($1, $2, $3)"
          : "UPDATE magazines SET issue_number = $1, publication_cycle = $2 WHERE item_id = $3",
        [item.getIssueNumber(), item.getPublicationCycle(), itemId],
      );
    }
  }
}
