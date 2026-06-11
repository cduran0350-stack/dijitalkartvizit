// Firebase Storage'a görsel yükleme işlemleri
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

/** İzin verilen görsel türleri ve en büyük dosya boyutu (5 MB) */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Profil fotoğrafını yükler ve herkese açık indirme URL'sini döndürür.
 * Dosya `photos/<uid>/avatar.<ext>` yoluna yazılır (storage.rules ile uyumlu);
 * aynı kullanıcı tekrar yüklerse eski dosyanın üzerine yazılır.
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    throw new Error("Firebase yapılandırılmadı. .env.local dosyasını doldurun.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Yalnızca JPG, PNG, WEBP veya GIF yükleyebilirsiniz.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Dosya çok büyük (en fazla 5 MB).");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectRef = ref(storage, `photos/${uid}/avatar.${ext}`);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return getDownloadURL(objectRef);
}

/** Yüklü profil fotoğrafını siler (URL Firebase Storage'a aitse). */
export async function deleteProfilePhoto(photoURL: string): Promise<void> {
  if (!isFirebaseConfigured || !storage || !photoURL) return;
  // Yalnızca kendi Storage'ımızdaki dosyaları silmeyi dene
  if (!photoURL.includes("firebasestorage.googleapis.com")) return;
  try {
    await deleteObject(ref(storage, photoURL));
  } catch {
    // Dosya zaten yoksa veya silinemezse sessizce geç
  }
}
