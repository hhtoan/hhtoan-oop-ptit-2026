import { redirect } from "next/navigation";
import { Librarian } from "@/domain/Librarian";
import { getCurrentUser } from "@/lib/auth";

/** Trang chủ: chuyển hướng theo vai trò. */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user instanceof Librarian ? "/admin/loans" : "/items");
}
