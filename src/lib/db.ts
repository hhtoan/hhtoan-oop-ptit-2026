import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://library:library@localhost:5432/library";

// CSDL trên cloud (vd. Supabase) bắt buộc SSL; Postgres chạy ở máy (Docker) thì không cần
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

// Pool kết nối dùng chung cho toàn ứng dụng
export const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

/** Thứ có thể chạy câu SQL: Pool (mặc định) hoặc 1 client đang trong transaction. */
export interface Queryable {
  query<R extends QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<R>>;
}

/** Chạy nhiều câu lệnh trong cùng một transaction: lỗi thì ROLLBACK toàn bộ. */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
