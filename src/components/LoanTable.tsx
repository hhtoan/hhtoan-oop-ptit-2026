import type { ReactNode } from "react";
import { LoanStatus } from "@/domain/enums";
import type { Loan } from "@/domain/Loan";
import { formatDate, formatMoney } from "@/lib/date";
import { LOAN_STATUS_LABEL } from "@/lib/labels";

interface LoanTableProps {
  loans: Loan[];
  showReader?: boolean;
  /** Các nút thao tác cho từng phiếu (nếu có). */
  actions?: (loan: Loan) => ReactNode;
}

/** Cột tiền phạt: đã trả → số đã chốt; đang quá hạn → tạm tính đến hôm nay. */
function FineCell({ loan }: { loan: Loan }) {
  if (loan.getStatus() === LoanStatus.RETURNED) {
    return <>{formatMoney(loan.getFineAmount())}</>;
  }
  if (loan.isOverdue()) {
    return (
      <span className="text-red-700">
        {formatMoney(loan.calculateFine())}
        <br />
        <small>(tạm tính, trễ {loan.getOverdueDays()} ngày)</small>
      </span>
    );
  }
  return <>—</>;
}

/** Bảng danh sách phiếu mượn, dùng chung cho độc giả và thủ thư. */
export function LoanTable({ loans, showReader = false, actions }: LoanTableProps) {
  if (loans.length === 0) {
    return <p className="text-sm text-gray-500">Không có phiếu nào.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Mã</th>
            {showReader && <th>Độc giả</th>}
            <th>Tài liệu</th>
            <th>Ngày yêu cầu</th>
            <th>Ngày mượn</th>
            <th>Hạn trả</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th>Tiền phạt</th>
            {actions && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.getId()}>
              <td>#{loan.getId()}</td>
              {showReader && <td>{loan.getReader().getFullName()}</td>}
              <td>
                {loan.getItem().getTitle()}
                <br />
                <small className="text-gray-500">{loan.getItem().getTypeName()}</small>
              </td>
              <td>{formatDate(loan.getRequestDate())}</td>
              <td>{formatDate(loan.getBorrowDate())}</td>
              <td>{formatDate(loan.getDueDate())}</td>
              <td>{formatDate(loan.getReturnDate())}</td>
              <td>
                {LOAN_STATUS_LABEL[loan.getStatus()]}
                {loan.isOverdue() && <span className="ml-1 font-semibold text-red-700">(Quá hạn)</span>}
              </td>
              <td>
                <FineCell loan={loan} />
              </td>
              {actions && <td className="whitespace-nowrap">{actions(loan)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
