// Yönetici: bir kullanıcının hem kartını (Firestore) hem de giriş hesabını
// (Authentication) siler. Böylece silinen e-posta tekrar kayıt edilebilir.
//
// Güvenlik: çağıran kişinin geçerli bir yönetici ID token'ı göndermesi gerekir.
import { adminAuth, adminDb, adminConfigured } from "@/lib/firebaseAdmin";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "not-configured" }, { status: 501 });
  }

  let body: { idToken?: string; uid?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  const { idToken, uid, email } = body || {};
  if (!idToken) {
    return Response.json({ error: "no-token" }, { status: 401 });
  }

  const auth = adminAuth();
  const db = adminDb();
  if (!auth || !db) {
    return Response.json({ error: "not-configured" }, { status: 501 });
  }

  // 1) Çağıranın gerçekten yönetici olduğunu doğrula
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return Response.json({ error: "invalid-token" }, { status: 401 });
  }
  if (!isAdminEmail(decoded.email)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // 2) Hedef kullanıcıyı çöz (uid veya e-posta ile)
  let targetUid = uid;
  if (!targetUid && email) {
    try {
      const u = await auth.getUserByEmail(email);
      targetUid = u.uid;
    } catch {
      // Bu e-posta ile giriş hesabı yok — silinecek bir şey yok, başarı say
      return Response.json({ ok: true, note: "no-auth-user" });
    }
  }
  if (!targetUid) {
    return Response.json({ error: "no-target" }, { status: 400 });
  }

  // 3) Firestore profilini ve istatistik alt koleksiyonlarını sil
  try {
    const profileRef = db.collection("profiles").doc(targetUid);
    for (const sub of ["views", "contacts"]) {
      const snap = await profileRef.collection(sub).get();
      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await profileRef.delete();
  } catch {
    // profil zaten yoksa sorun değil, devam et
  }

  // 4) Giriş hesabını (Authentication) sil
  try {
    await auth.deleteUser(targetUid);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code !== "auth/user-not-found") {
      return Response.json({ error: "auth-delete-failed" }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
