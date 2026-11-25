import { LoanTable } from "@/components/LoanTable";
import { LoanStatus } from "@/domain/enums";
import { requireReader } from "@/lib/auth";

/** Độc giả xem phiếu đang mượn / chờ duyệt và lịch sử mượn. */
export default async function MyLoansPage() {
  const reader = await requireReader();
  const loans = await reader.viewLoanHistory();

  const activeStatuses = [LoanStatus.PENDING, LoanStatus.BORROWED];
  const currentLoans = loans.filter((loan) => activeStatuses.includes(loan.getStatus()));
  const pastLoans = loans.filter((loan) => !activeStatuses.includes(loan.getStatus()));

  return (
    <div>
      <h1 className="page-title">Phiếu mượn của tôi</h1>

      <h2 className="section-title">Đang mượn / chờ duyệt</h2>
      <LoanTable loans={currentLoans} />

      <h2 className="section-title">Lịch sử</h2>
      <LoanTable loans={pastLoans} />
    </div>
  );
}
