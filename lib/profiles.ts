// Firestore profil okuma/yazma işlemleri
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { Profile } from "./types";
import { sampleProfile } from "./sample";

const COLLECTION = "profiles";

/** Kullanıcı adına göre herkese açık profil getir */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  // Firebase yoksa demo profili göster
  if (!isFirebaseConfigured || !db) {
    return username === sampleProfile.username ? sampleProfile : null;
  }
  const q = query(
    collection(db, COLLECTION),
    where("username", "==", username.toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Profile;
}

/** E-postaya göre profil getir (aktif kart kontrolü için) */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  if (!isFirebaseConfigured || !db) return null;
  const q = query(
    collection(db, COLLECTION),
    where("email", "==", email.toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Profile;
}

/** Sahibin uid'sine göre profil getir (panel için) */
export async function getProfileByUid(uid: string): Promise<Profile | null> {
  if (!isFirebaseConfigured || !db) return null;
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Profile) : null;
}

/** Kullanıcı adı boşta mı? */
export async function isUsernameAvailable(username: string, selfUid?: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return true;
  const q = query(
    collection(db, COLLECTION),
    where("username", "==", username.toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return true;
  return snap.docs[0].id === selfUid; // kendi kaydıysa sorun yok
}

/** Profili kaydet (doküman kimliği = uid) */
export async function saveProfile(profile: Profile): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase yapılandırılmadı. .env.local dosyasını doldurun.");
  }
  const data: Profile = {
    ...profile,
    username: profile.username.toLowerCase(),
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, COLLECTION, profile.uid), data, { merge: true });
}

/* ----------------- Yönetici işlemleri ----------------- */

/** Tüm profilleri getir (süper yönetici paneli) */
export async function getAllProfiles(): Promise<Profile[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy("updatedAt", "desc")));
    return snap.docs.map((d) => d.data() as Profile);
  } catch {
    // updatedAt olmayan eski kayıtlar için sırasız dene
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => d.data() as Profile);
  }
}

/** Bir profili sil (sahibi veya yönetici) */
export async function deleteProfileByUid(uid: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await deleteDoc(doc(db, COLLECTION, uid));
}

/** Yayın durumunu değiştir (yönetici hızlı aç/kapat) */
export async function setProfilePublished(uid: string, published: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, COLLECTION, uid), { published });
}

/** Zorunlu şifre değiştirme bayrağını ayarla (ilk giriş sonrası kapatılır) */
export async function setMustChangePassword(uid: string, value: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, COLLECTION, uid), { mustChangePassword: value });
}
