// Süper yönetici kontrolü (e-posta tabanlı)
// Birden fazla yönetici için virgülle ayır: a@x.com,b@y.com
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "cduran0350@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
