# Hệ thống Quản lý Thư viện trực tuyến

Bài tập lớn môn **Kỹ thuật Lập trình Hướng đối tượng**.

Công nghệ: Next.js (App Router) + TypeScript + Tailwind CSS + PostgreSQL (`pg`, SQL thuần, **không dùng ORM**).
Việc chuyển dòng dữ liệu thành đối tượng do các lớp Repository tự làm.

## 1. Cài đặt và chạy

Yêu cầu: Node.js 20 trở lên, Docker.

```bash
npm install
docker compose up -d     # chạy PostgreSQL; lần đầu tự chạy db/schema.sql + db/seed.sql
npm run dev              # mở http://localhost:3000
```

- Muốn xóa sạch và nạp lại dữ liệu mẫu: `npm run db:reset`
- Dùng Postgres có sẵn (không dùng Docker): tạo file `.env` theo mẫu `.env.example` rồi chạy
  `psql "$DATABASE_URL" -f db/schema.sql -f db/seed.sql`
- Kiểm tra code: `npm run lint`, `npm run build`

### Dùng CSDL trên Supabase (thay cho Docker)

Project Supabase `library-oop` đã có sẵn bảng và dữ liệu mẫu. Các bảng đã bật RLS để chặn truy cập qua API công khai.
App kết nối bằng user `postgres` nên không bị RLS chặn.

1. Vào Supabase → project `library-oop` → nút **Connect** → chọn **Session pooler**, rồi copy chuỗi URI.
2. Tạo file `.env` ở thư mục gốc, thay `[YOUR-PASSWORD]` bằng mật khẩu database của project:
   ```
   DATABASE_URL=postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-...pooler.supabase.com:5432/postgres
   ```
3. Chạy `npm run dev` (không cần `docker compose`).

Nếu muốn nạp lại dữ liệu mẫu: mở **SQL Editor** trên Supabase, chạy nội dung `db/schema.sql` rồi `db/seed.sql`.

### Tài khoản mẫu

| Vai trò  | Email                 | Mật khẩu    |
| -------- | --------------------- | ----------- |
| Thủ thư  | `admin@library.local` | `admin123`  |
| Độc giả  | `an@library.local`    | `reader123` |
| Độc giả  | `binh@library.local`  | `reader123` |

Dữ liệu mẫu có 6 sách, 4 tạp chí và 6 phiếu mượn đủ các trạng thái. Phiếu #4 (của Bình) đang **quá hạn 6 ngày**.

### Luồng demo

Đăng ký độc giả mới → `/items` tìm và bấm **Mượn** → đăng nhập thủ thư → `/admin/loans` bấm **Duyệt**
→ **Ghi nhận trả** (thử với phiếu quá hạn #4 sẽ ra tiền phạt 30.000 đ) → `/admin/stats` xem thống kê.

## 2. Bốn tính chất OOP nằm ở đâu

| Tính chất     | Vị trí trong code | Giải thích |
| ------------- | ----------------- | ---------- |
| **Trừu tượng** | `src/domain/User.ts`, `src/domain/LibraryItem.ts`, `src/services/ILoanManager.ts` | `User` và `LibraryItem` là `abstract class`; `LibraryItem` khai báo `calculateLoanPeriod()` và `calculateFine()` là abstract. `ILoanManager` là interface, được `LoanManager` cài đặt (`implements`). |
| **Kế thừa**    | `src/domain/Reader.ts`, `Librarian.ts`, `Book.ts`, `Magazine.ts` | `Reader`, `Librarian` kế thừa `User`; `Book`, `Magazine` kế thừa `LibraryItem` và gọi `super(...)`. |
| **Đóng gói**   | `src/domain/User.ts`, `Reader.ts`, `LibraryItem.ts`, `Loan.ts` | `password` là `private`, chỉ được kiểm tra bên trong `login()`. `locked`, `status` là `private`, truy cập qua `isLocked()/setLocked()`, `getStatus()/setStatus()`. Mọi thay đổi trạng thái phiếu đều đi qua `Loan.approve()`, `reject()`, `markReturned()`, và các hàm này có kiểm tra điều kiện trước khi đổi. |
| **Đa hình**    | `src/domain/Loan.ts` → `calculateFine()`; `Book.ts`, `Magazine.ts` | `Loan.calculateFine()` chỉ gọi `this.item.calculateFine(overdueDays)`, không có if/switch theo loại. Sách tự tính 5.000 đ/ngày, Tạp chí tự tính 2.000 đ/ngày. Tương tự, `calculateLoanPeriod()` trả về 14 hoặc 7 ngày. |

Thêm: `LibraryItemRepository.toItem()` là **factory** (`item_type = 'BOOK'` → `new Book`, `'MAGAZINE'` → `new Magazine`),
còn `UserRepository.toUser()` dựa vào `role` để tạo `Reader` hoặc `Librarian`.

## 3. Cấu trúc thư mục

```
db/schema.sql, db/seed.sql     -- tạo bảng, dữ liệu mẫu
src/domain/                    -- lớp nghiệp vụ: User, Reader, Librarian, LibraryItem, Book, Magazine, Loan, enums
src/services/                  -- ILoanManager (interface) và LoanManager (luật mượn - trả)
src/repositories/              -- SQL + ánh xạ row → object
src/lib/                       -- db.ts (Pool, transaction), auth.ts (đăng nhập), date.ts, labels.ts
src/app/                       -- giao diện (các trang) và app/actions (Server Actions)
src/components/                -- component dùng chung (bảng phiếu mượn, form tài liệu...)
```

Luồng một thao tác, ví dụ **Duyệt phiếu**:
`app/actions/loans.ts` → `LoanManager.approveLoan(loan)` → `loan.approve()` (đổi trạng thái phiếu và tài liệu)
→ `LoanRepository.update()` + `LibraryItemRepository.updateStatus()` trong cùng 1 transaction.

## 4. Ghi chú thiết kế

- **Đăng nhập đơn giản:** mật khẩu được băm bằng `bcryptjs`. Đăng nhập đúng email và mật khẩu thì id người dùng được lưu vào cookie,
  và mỗi trang tự kiểm tra vai trò (`requireReader()` / `requireLibrarian()` trong `src/lib/auth.ts`).
  Cách này chỉ phù hợp cho bài tập, chưa đủ an toàn cho hệ thống thật.
- Các phương thức có đọc/ghi CSDL trả về `Promise<...>`, ví dụ `searchItems(keyword): Promise<LibraryItem[]>`,
  vì truy vấn PostgreSQL là bất đồng bộ. Tên và tham số giữ nguyên như sơ đồ lớp.
- Ký hiệu `#` trong sơ đồ lớp (UML) nghĩa là `protected`, nên code dùng từ khóa `protected` (không phải private field `#` của JavaScript).
- `ILoanManager` có thêm `rejectLoan(loan)` để thủ thư từ chối phiếu (luật nghiệp vụ 2).
- Hằng số mượn/phạt đặt ở `Book.LOAN_DAYS`, `Book.FINE_PER_DAY`, `Magazine.LOAN_DAYS`, `Magazine.FINE_PER_DAY`.
