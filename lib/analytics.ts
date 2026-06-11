// Profil ziyareti ve rehbere ekleme istatistikleri
import {
  collection,
  addDoc,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type EventType = "view" | "contact";

// Olay türüne göre alt koleksiyon adı (ts üzerinde tekil index yeter, composite gerekmez)
const coll = (type: EventType) => (type === "view" ? "views" : "contacts");

/** Bir olayı kaydet (ziyaretçiler de yazabilir — kurallar buna izin verir) */
export async function logEvent(uid: string, type: EventType): Promise<void> {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    await addDoc(collection(db, "profiles", uid, coll(type)), {
      ts: Date.now(),
    });
  } catch {
    // istatistik kaydı kritik değil, sessizce geç
  }
}

/** Gün/hafta/ay/yıl başlangıç zaman damgaları (ms) */
function boundaries() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dow = (now.getDay() + 6) % 7; // Pazartesi = 0
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dow
  ).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  return { startOfDay, startOfWeek, startOfMonth, startOfYear };
}

async function countSince(uid: string, type: EventType, since: number): Promise<number> {
  if (!db) return 0;
  const q =
    since > 0
      ? query(collection(db, "profiles", uid, coll(type)), where("ts", ">=", since))
      : query(collection(db, "profiles", uid, coll(type)));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export interface Stats {
  day: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

const EMPTY: Stats = { day: 0, week: 0, month: 0, year: 0, total: 0 };

/** Bir profilin tüm dönem sayımlarını getir */
export async function getStats(uid: string, type: EventType): Promise<Stats> {
  if (!isFirebaseConfigured || !db || !uid) return EMPTY;
  const b = boundaries();
  try {
    const [day, week, month, year, total] = await Promise.all([
      countSince(uid, type, b.startOfDay),
      countSince(uid, type, b.startOfWeek),
      countSince(uid, type, b.startOfMonth),
      countSince(uid, type, b.startOfYear),
      countSince(uid, type, 0),
    ]);
    return { day, week, month, year, total };
  } catch {
    return EMPTY;
  }
}
