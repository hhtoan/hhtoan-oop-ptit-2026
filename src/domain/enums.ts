/** Trạng thái của một tài liệu trong thư viện. */
export enum ItemStatus {
  AVAILABLE = "AVAILABLE",
  BORROWED = "BORROWED",
}

/** Trạng thái của một phiếu mượn. */
export enum LoanStatus {
  PENDING = "PENDING",
  BORROWED = "BORROWED",
  RETURNED = "RETURNED",
  REJECTED = "REJECTED",
}

/** Vai trò người dùng. */
export enum UserRole {
  READER = "READER",
  LIBRARIAN = "LIBRARIAN",
}
