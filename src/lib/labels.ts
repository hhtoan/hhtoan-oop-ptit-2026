import { ItemStatus, LoanStatus } from "@/domain/enums";

// Nhãn tiếng Việt cho các enum, dùng trên giao diện
export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  [ItemStatus.AVAILABLE]: "Có sẵn",
  [ItemStatus.BORROWED]: "Đang được mượn",
};

export const LOAN_STATUS_LABEL: Record<LoanStatus, string> = {
  [LoanStatus.PENDING]: "Chờ duyệt",
  [LoanStatus.BORROWED]: "Đang mượn",
  [LoanStatus.RETURNED]: "Đã trả",
  [LoanStatus.REJECTED]: "Bị từ chối",
};
