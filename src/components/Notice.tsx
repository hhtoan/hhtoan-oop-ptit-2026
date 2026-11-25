type SearchParams = Record<string, string | string[] | undefined>;

/** Hiển thị thông báo thành công (?message=) hoặc lỗi (?error=) trên URL. */
export function Notice({ params }: { params: SearchParams }) {
  const { message, error } = params;
  return (
    <>
      {typeof message === "string" && (
        <p className="mb-4 rounded border border-green-300 bg-green-50 p-2 text-green-800">{message}</p>
      )}
      {typeof error === "string" && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-2 text-red-800">{error}</p>
      )}
    </>
  );
}
