-- Xóa bảng cũ (nếu có) để có thể chạy lại script nhiều lần
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS magazines;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS library_items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('READER','LIBRARIAN')),
  is_locked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE library_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('BOOK','MAGAZINE')),
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','BORROWED'))
);

CREATE TABLE books (
  item_id INT PRIMARY KEY REFERENCES library_items(id) ON DELETE CASCADE,
  publisher VARCHAR(255),
  publish_year INT
);

CREATE TABLE magazines (
  item_id INT PRIMARY KEY REFERENCES library_items(id) ON DELETE CASCADE,
  issue_number INT,
  publication_cycle VARCHAR(50)
);

CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  reader_id INT NOT NULL REFERENCES users(id),
  item_id INT NOT NULL REFERENCES library_items(id),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  borrow_date DATE,
  due_date DATE,
  return_date DATE,
  fine_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','BORROWED','RETURNED','REJECTED'))
);
