import { LoanTable } from "@/components/LoanTable";
import { requireLibrarian } from "@/lib/auth";

export default async function AdminStatsPage() {
  const librarian = await requireLibrarian();
  const stats = await librarian.viewStatistics();

  const cards = [
    { label: "Tổng số tài liệu", value: stats.totalItems },
    { label: "Đang được mượn", value: stats.borrowedItems },
    { label: "Phiếu quá hạn", value: stats.overdueLoans.length },
  ];

  return (
    <div>
      <h1 className="page-title">Thống kê</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Danh sách phiếu quá hạn</h2>
      <LoanTable loans={stats.overdueLoans} showReader />
    </div>
  );
}
