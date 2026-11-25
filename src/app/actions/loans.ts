"use server";

import type { Loan } from "@/domain/Loan";
import { readNumber, readText, runAndRedirect } from "@/lib/actionResult";
import { requireLibrarian, requireReader } from "@/lib/auth";
import { formatMoney } from "@/lib/date";
import { LibraryItemRepository } from "@/repositories/LibraryItemRepository";
import { LoanRepository } from "@/repositories/LoanRepository";
import { LoanManager } from "@/services/LoanManager";

const loanManager = new LoanManager();

async function findLoan(formData: FormData): Promise<Loan> {
  const loan = await new LoanRepository().findById(readNumber(formData, "loanId") ?? 0);
  if (!loan) throw new Error("Không tìm thấy phiếu mượn");
  return loan;
}

/** Độc giả gửi yêu cầu mượn. */
export async function borrowAction(formData: FormData): Promise<void> {
  const reader = await requireReader();
  const keyword = readText(formData, "q");
  await runAndRedirect(`/items?q=${encodeURIComponent(keyword)}`, async () => {
    const item = await new LibraryItemRepository().findById(readNumber(formData, "itemId") ?? 0);
    if (!item) throw new Error("Không tìm thấy tài liệu");
    await loanManager.createLoanRequest(reader, item);
    return `Đã gửi yêu cầu mượn "${item.getTitle()}". Vui lòng chờ thủ thư duyệt.`;
  });
}

/** Thủ thư duyệt phiếu. */
export async function approveLoanAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  await runAndRedirect("/admin/loans", async () => {
    const loan = await findLoan(formData);
    await loanManager.approveLoan(loan);
    return `Đã duyệt phiếu #${loan.getId()}, hạn trả ${loan.getDueDate()?.toLocaleDateString("vi-VN")}`;
  });
}

/** Thủ thư từ chối phiếu. */
export async function rejectLoanAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  await runAndRedirect("/admin/loans", async () => {
    const loan = await findLoan(formData);
    await loanManager.rejectLoan(loan);
    return `Đã từ chối phiếu #${loan.getId()}`;
  });
}

/** Thủ thư ghi nhận trả tài liệu. */
export async function returnLoanAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  await runAndRedirect("/admin/loans", async () => {
    const loan = await findLoan(formData);
    await loanManager.returnItem(loan);
    return `Đã ghi nhận trả phiếu #${loan.getId()}. Tiền phạt: ${formatMoney(loan.getFineAmount())}`;
  });
}
