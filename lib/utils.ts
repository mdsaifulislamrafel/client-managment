export const today = () => new Date().toISOString().slice(0, 10);
export const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");
export const taka = (n: number | string | undefined) =>
  `৳ ${Number(n || 0).toLocaleString("en-US")}`;
export const JSON_HEADERS = { "Content-Type": "application/json" };
