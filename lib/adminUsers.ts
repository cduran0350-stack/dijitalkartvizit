// Yöneticinin yeni kullanıcı (giriş hesabı) oluşturması için yardımcılar.
//
// Sorun: createUserWithEmailAndPassword normalde yeni kullanıcıyla otomatik
// giriş yapar ve yöneticinin oturumunu düşürür. Çözüm: geçici (ikincil) bir
// Firebase app örneği açıp hesabı orada oluşturmak; yöneticinin asıl oturumu
// hiç etkilenmez.
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "./firebase";

/**
 * Yeni bir giriş hesabı oluşturur ve oluşturulan kullanıcının uid'sini döndürür.
 * Yöneticinin mevcut oturumunu bozmaz.
 */
export async function createUserAccount(
  email: string,
  password: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase yapılandırılmadı. .env.local dosyasını doldurun.");
  }

  // Benzersiz bir isimle geçici app aç (asıl app ile çakışmasın)
  const name = `admin-create-${Date.now()}-${Math.floor(
    Math.random() * 1e6
  )}`;
  const secondary = initializeApp(firebaseConfig, name);
  const secondaryAuth = getAuth(secondary);

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    return cred.user.uid;
  } finally {
    // Geçici oturumu ve app'i temizle
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondary).catch(() => {});
  }
}

/** Firebase Auth hata kodlarını Türkçe mesaja çevirir. */
export function authHataMesaji(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/operation-not-allowed":
      "E-posta/şifre girişi Firebase konsolunda etkin değil.",
  };
  return map[code] || (err as Error)?.message || "Hesap oluşturulamadı.";
}
