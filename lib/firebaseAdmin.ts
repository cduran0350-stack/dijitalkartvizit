// Sunucu tarafı Firebase Admin SDK başlatıcısı.
// Kullanıcı (Authentication) hesaplarını silmek gibi ayrıcalıklı işlemler için.
//
// Gerekli ortam değişkenleri (Vercel + .env.local):
//   FIREBASE_CLIENT_EMAIL  → service account e-postası
//   FIREBASE_PRIVATE_KEY   → service account özel anahtarı (private key)
//   (proje kimliği NEXT_PUBLIC_FIREBASE_PROJECT_ID üzerinden alınır)
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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

let cached: App | null = null;

/** Admin app örneğini döndürür (yapılandırılmamışsa null). */
export function getAdminApp(): App | null {
  if (!adminConfigured()) return null;
  if (cached) return cached;
  cached = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: projectId!,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
      });
  return cached;
}

export function adminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function adminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
