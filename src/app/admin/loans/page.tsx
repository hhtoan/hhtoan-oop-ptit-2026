import { approveLoanAction, rejectLoanAction, returnLoanAction } from "@/app/actions/loans";
import { LoanTable } from "@/components/LoanTable";
import { Notice } from "@/components/Notice";
import { LoanStatus } from "@/domain/enums";
import type { Loan } from "@/domain/Loan";
import { requireLibrarian } from "@/lib/auth";
import { LoanRepository } from "@/repositories/LoanRepository";
import { LoanManager } from "@/services/LoanManager";

/** Nút gửi form kèm mã phiếu. */
function LoanButton({ loan, action, label, className }: {
  loan: Loan;
  action: (formData: FormData) => Promise<void>;
  label: string;
  className: string;
}) {
  return (
    <form action={action} className="mr-2 inline">
      <input type="hidden" name="loanId" value={loan.getId()} />
      <button className={className}>{label}</button>
    </form>
  );
}

export default async function AdminLoansPage({ searchParams }: PageProps<"/admin/loans">) {
  await requireLibrarian();
  const params = await searchParams;
  const repository = new LoanRepository();

  const pendingLoans = await repository.findByStatus(LoanStatus.PENDING);
  const borrowedLoans = await repository.findByStatus(LoanStatus.BORROWED);
  const overdueLoans = await new LoanManager().getOverdueLoans();

  return (
    <div>
      <h1 className="page-title">Quản lý phiếu mượn</h1>
      <Notice params={params} />

      <h2 className="section-title">Chờ duyệt ({pendingLoans.length})</h2>
      <LoanTable
        loans={pendingLoans}
        showReader
        actions={(loan) => (
          <>
            <LoanButton loan={loan} action={approveLoanAction} label="Duyệt" className="btn" />
            <LoanButton loan={loan} action={rejectLoanAction} label="Từ chối" className="btn-red" />
          </>
        )}
      />

      <h2 className="section-title">Đang mượn ({borrowedLoans.length})</h2>
      <LoanTable
        loans={borrowedLoans}
        showReader
        actions={(loan) => (
          <LoanButton loan={loan} action={returnLoanAction} label="Ghi nhận trả" className="btn" />
        )}
      />

      <h2 className="section-title text-red-700">Quá hạn ({overdueLoans.length})</h2>
      <LoanTable loans={overdueLoans} showReader />
    </div>
  );
}
