-- Dữ liệu mẫu. Chạy SAU schema.sql (schema.sql tạo lại bảng nên id bắt đầu từ 1).
-- Mật khẩu đã được băm bằng bcrypt:
--   admin@library.local / admin123
--   an@library.local, binh@library.local / reader123

INSERT INTO users (full_name, email, password_hash, role, is_locked) VALUES
  ('Quản trị Thư viện', 'admin@library.local', '$2b$10$4cJQL2ZNnjs/WYif7URfVeCTy/yx3c1L4yLZCSh9weHF41H78t8MK', 'LIBRARIAN', FALSE), -- id 1
  ('Nguyễn Văn An',     'an@library.local',    '$2b$10$zIXwtsW2D3/cBlt9Jt7RB.0os6TpHZddRvzjtkKFaTe2eJ0weN0x6', 'READER',    FALSE), -- id 2
  ('Trần Thị Bình',     'binh@library.local',  '$2b$10$zIXwtsW2D3/cBlt9Jt7RB.0os6TpHZddRvzjtkKFaTe2eJ0weN0x6', 'READER',    FALSE); -- id 3

-- 6 sách (id 1 - 6) và 4 tạp chí (id 7 - 10)
INSERT INTO library_items (title, author, category, item_type, status) VALUES
  ('Lập trình hướng đối tượng với Java', 'Nguyễn Văn Hiếu', 'Công nghệ thông tin', 'BOOK', 'AVAILABLE'),     -- 1
  ('Clean Code',                         'Robert C. Martin', 'Công nghệ thông tin', 'BOOK', 'BORROWED'),     -- 2
  ('Cấu trúc dữ liệu và giải thuật',     'Đỗ Xuân Lôi',      'Công nghệ thông tin', 'BOOK', 'BORROWED'),     -- 3
  ('Dế Mèn phiêu lưu ký',                'Tô Hoài',          'Văn học',             'BOOK', 'AVAILABLE'),    -- 4
  ('Số đỏ',                              'Vũ Trọng Phụng',   'Văn học',             'BOOK', 'AVAILABLE'),    -- 5
  ('Lược sử thời gian',                  'Stephen Hawking',  'Khoa học',            'BOOK', 'AVAILABLE'),    -- 6
  ('Tạp chí Tin học và Đời sống',        'Hội Tin học VN',   'Công nghệ thông tin', 'MAGAZINE', 'AVAILABLE'),-- 7
  ('Tạp chí Khoa học Phổ thông',         'Liên hiệp Hội KH', 'Khoa học',            'MAGAZINE', 'AVAILABLE'),-- 8
  ('Tạp chí Thế giới Vi tính',           'PC World VN',      'Công nghệ thông tin', 'MAGAZINE', 'AVAILABLE'),-- 9
  ('Tạp chí Văn nghệ Quân đội',          'Bộ Quốc phòng',    'Văn học',             'MAGAZINE', 'AVAILABLE');-- 10

INSERT INTO books (item_id, publisher, publish_year) VALUES
  (1, 'NXB Bách khoa Hà Nội', 2020),
  (2, 'Prentice Hall',        2008),
  (3, 'NXB Giáo dục',         2015),
  (4, 'NXB Kim Đồng',         2019),
  (5, 'NXB Văn học',          2016),
  (6, 'NXB Trẻ',              2018);

INSERT INTO magazines (item_id, issue_number, publication_cycle) VALUES
  (7,  245, 'Hàng tháng'),
  (8,  12,  'Hàng tuần'),
  (9,  310, 'Hàng tháng'),
  (10, 88,  'Hàng tháng');

-- Phiếu mượn ở đủ các trạng thái
INSERT INTO loans (reader_id, item_id, request_date, borrow_date, due_date, return_date, fine_amount, status) VALUES
  -- Đã trả đúng hạn
  (2, 1, CURRENT_DATE - 30, CURRENT_DATE - 29, CURRENT_DATE - 15, CURRENT_DATE - 16, 0,    'RETURNED'),
  -- Tạp chí trả trễ 3 ngày: 3 x 2.000 = 6.000 đ
  (2, 7, CURRENT_DATE - 21, CURRENT_DATE - 20, CURRENT_DATE - 13, CURRENT_DATE - 10, 6000, 'RETURNED'),
  -- Đang mượn, còn hạn
  (2, 2, CURRENT_DATE - 4,  CURRENT_DATE - 3,  CURRENT_DATE + 11, NULL, 0, 'BORROWED'),
  -- Đang mượn, QUÁ HẠN 6 ngày
  (3, 3, CURRENT_DATE - 21, CURRENT_DATE - 20, CURRENT_DATE - 6,  NULL, 0, 'BORROWED'),
  -- Chờ duyệt
  (3, 8, CURRENT_DATE - 1,  NULL, NULL, NULL, 0, 'PENDING'),
  -- Bị từ chối
  (2, 4, CURRENT_DATE - 5,  NULL, NULL, NULL, 0, 'REJECTED');
