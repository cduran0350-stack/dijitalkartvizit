// Yönetici: bir kullanıcının şifresini varsayılan 123456'ya sıfırlar ve
// ilk girişte tekrar değiştirmesi için mustChangePassword bayrağını açar.
//
// Güvenlik: çağıran kişinin geçerli bir yönetici ID token'ı göndermesi gerekir.
import { getAdmin, adminConfigured } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

const DEFAULT_PASSWORD = "123456";

export async function POST(request: Request) {
  try {
    if (!adminConfigured()) {
      return Response.json({ error: "not-configured" }, { status: 501 });
    }

    let body: { idToken?: string; uid?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "bad-request" }, { status: 400 });
    }

    const { idToken, uid } = body || {};
    if (!idToken) {
      return Response.json({ error: "no-token" }, { status: 401 });
    }
    if (!uid) {
      return Response.json({ error: "no-target" }, { status: 400 });
    }

    let auth, db;
    try {
      ({ auth, db } = await getAdmin());
    } catch (e) {
      return Response.json(
        { error: "admin-init-failed", detail: (e as Error)?.message },
        { status: 500 }
      );
    }

    // Çağıran yönetici mi?
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (e) {
      return Response.json(
        { error: "invalid-token", detail: (e as Error)?.message },
        { status: 401 }
      );
    }
    if (!isAdminEmail(decoded.email)) {
      return Response.json(
        { error: "forbidden", detail: `not-admin: ${decoded.email}` },
        { status: 403 }
      );
    }

    // 1) Şifreyi 123456'ya çek
    try {
      await auth.updateUser(uid, { password: DEFAULT_PASSWORD });
    } catch (e) {
      return Response.json(
        { error: "password-reset-failed", detail: (e as Error)?.message },
        { status: 500 }
      );
    }

    // 2) İlk girişte tekrar değiştirmesi için bayrağı aç
    try {
      await db
        .collection("profiles")
        .doc(uid)
        .set({ mustChangePassword: true }, { merge: true });
    } catch {
      // profil dökümanı yoksa şifre yine sıfırlandı, sorun değil
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: "server-error", detail: (e as Error)?.message },
      { status: 500 }
    );
  }
}
