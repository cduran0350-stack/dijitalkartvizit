// Sunucu tarafı Firebase Admin SDK başlatıcısı.
// Kullanıcı (Authentication) hesaplarını silmek gibi ayrıcalıklı işlemler için.
//
// Gerekli ortam değişkenleri (Vercel + .env.local):
//   FIREBASE_CLIENT_EMAIL  → service account e-postası
//   FIREBASE_PRIVATE_KEY   → service account özel anahtarı (private key)
//   (proje kimliği NEXT_PUBLIC_FIREBASE_PROJECT_ID üzerinden alınır)
//
// Not: firebase-admin yalnızca fonksiyonlar çağrıldığında DİNAMİK import edilir;
// böylece modül yüklenirken oluşabilecek hatalar bile yakalanıp JSON dönebilir.
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

// Özel anahtarı her formatta kabul et:
// - başına/sonuna yanlışlıkla eklenen tırnakları temizle
// - \n kaçışlarını gerçek satır sonuna çevir
function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");
  return key;
}

const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

/** Admin SDK için gerekli ortam değişkenleri tanımlı mı? */
export function adminConfigured(): boolean {
  return Boolean(projectId && clientEmail && privateKey);
}

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

/** Admin SDK'yı (gerekirse) başlatır ve auth + db döndürür. */
export async function getAdmin(): Promise<{ auth: Auth; db: Firestore }> {
  if (cachedAuth && cachedDb) return { auth: cachedAuth, db: cachedDb };
  if (!adminConfigured()) {
    throw new Error("admin-not-configured");
  }

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: projectId!,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
      });

  cachedAuth = getAuth(app);
  cachedDb = getFirestore(app);
  return { auth: cachedAuth, db: cachedDb };
}
