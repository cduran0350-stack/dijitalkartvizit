"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, type User } from "firebase/auth";
import {
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaWifi,
  FaUpRightFromSquare,
  FaRightFromBracket,
  FaGripVertical,
  FaUsers,
  FaCamera,
  FaRotateLeft,
  FaHouse,
} from "react-icons/fa6";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/admin";
import StatsPanel from "@/components/StatsPanel";
import ChangePassword from "@/components/ChangePassword";
import { PLATFORM_LIST, PLATFORMS } from "@/lib/platforms";
import type { CardLink, LinkType, Profile } from "@/lib/types";
import { getProfileByUid, isUsernameAvailable, saveProfile } from "@/lib/profiles";
import { uploadProfilePhoto, deleteProfilePhoto } from "@/lib/storage";
import { clearStats } from "@/lib/analytics";

function emptyProfile(user: User): Profile {
  return {
    uid: user.uid,
    username: "",
    published: false,
    fullName: user.displayName || "",
    title: "",
    company: "",
    bio: "",
    photoURL: user.photoURL || "",
    themeColor: "#6d28d9",
    email: user.email || "",
    phone: "",
    website: "",
    links: [],
  };
}

// Yöneticinin başka bir uid için boş kart oluşturması
function emptyProfileForUid(uid: string): Profile {
  return {
    uid,
    username: "",
    published: false,
    fullName: "",
    title: "",
    company: "",
    bio: "",
    photoURL: "",
    themeColor: "#6d28d9",
    email: "",
    phone: "",
    website: "",
    links: [],
  };
}

let idCounter = 1;
const newId = () => `l${Date.now()}_${idCounter++}`;

export default function Editor({
  user,
  adminEditUid,
}: {
  user: User;
  adminEditUid?: string;
}) {
  // Yönetici modunda hedef uid; normalde giriş yapan kullanıcının uid'si
  const adminMode = Boolean(adminEditUid);
  const editUid = adminEditUid || user.uid;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [statsKey, setStatsKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfileByUid(editUid)
      .then((p) =>
        setProfile(p || (adminMode ? emptyProfileForUid(editUid) : emptyProfile(user)))
      )
      .finally(() => setLoading(false));
  }, [user, editUid, adminMode]);

  const siteUrl = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")),
    []
  );

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-violet-600" />
      </div>
    );
  }

  const set = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin
    if (!file) return;
    setPhotoError(null);
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(editUid, file);
      set({ photoURL: url });
    } catch (err) {
      setPhotoError((err as Error).message || "Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    const current = profile.photoURL;
    set({ photoURL: "" });
    if (current) await deleteProfilePhoto(current);
  };

  const initials = (profile.fullName || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const addLink = (type: LinkType) => {
    const link: CardLink = { id: newId(), type, value: "" };
    set({ links: [...profile.links, link] });
  };
  const updateLink = (id: string, patch: Partial<CardLink>) =>
    set({ links: profile.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const removeLink = (id: string) =>
    set({ links: profile.links.filter((l) => l.id !== id) });
  const moveLink = (index: number, dir: -1 | 1) => {
    const links = [...profile.links];
    const j = index + dir;
    if (j < 0 || j >= links.length) return;
    [links[index], links[j]] = [links[j], links[index]];
    set({ links });
  };
  // Sürükle-bırak ile yeniden sırala
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const links = [...profile.links];
    const [moved] = links.splice(from, 1);
    links.splice(to, 0, moved);
    set({ links });
  };

  const save = async () => {
    setUsernameError(null);
    setStatus(null);

    const uname = profile.username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,30}$/.test(uname)) {
      setUsernameError("Kullanıcı adı 3-30 karakter; küçük harf, rakam, - ve _ olabilir.");
      return;
    }
    if (!profile.fullName.trim()) {
      setStatus("Lütfen ad-soyad girin.");
      return;
    }

    setSaving(true);
    try {
      const available = await isUsernameAvailable(uname, editUid);
      if (!available) {
        setUsernameError("Bu kullanıcı adı alınmış, başka deneyin.");
        setSaving(false);
        return;
      }
      await saveProfile({ ...profile, username: uname });
      setStatus("✓ Kaydedildi!");
    } catch (e) {
      setStatus((e as Error).message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // Kartı sıfırla: ad-soyad, kullanıcı adı, e-posta ve telefon dışındaki her şeyi
  // temizler; ziyaret ve rehbere ekleme istatistiklerini de sıfırlar.
  const resetCard = async () => {
    const ok = window.confirm(
      "Bu kartı sıfırlamak istediğinize emin misiniz?\n\n" +
        "Ad-soyad, kullanıcı adı, e-posta ve telefon KORUNUR.\n" +
        "Ünvan, şirket, hakkında, fotoğraf, tema, web sitesi ve tüm bağlantılar SİLİNİR.\n" +
        "Ziyaret ve rehbere eklenme istatistikleri de SIFIRLANIR.\n\n" +
        "Bu işlem geri alınamaz."
    );
    if (!ok) return;

    setStatus(null);
    setResetting(true);
    try {
      // Varsa profil fotoğrafını da depolama alanından kaldır
      if (profile.photoURL) {
        try {
          await deleteProfilePhoto(profile.photoURL);
        } catch {
          /* fotoğraf silinemese de devam et */
        }
      }

      const cleared: Profile = {
        ...profile,
        // Korunan alanlar
        uid: profile.uid,
        username: profile.username,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        // Sıfırlanan alanlar
        title: "",
        company: "",
        bio: "",
        photoURL: "",
        coverURL: "",
        themeColor: "#6d28d9",
        website: "",
        links: [],
      };

      await saveProfile(cleared);
      await clearStats(editUid);
      setProfile(cleared);
      setStatsKey((k) => k + 1); // istatistik panelini yenile
      setStatus("✓ Kart sıfırlandı (ad, kullanıcı adı, e-posta, telefon korundu).");
    } catch (e) {
      setStatus((e as Error).message || "Sıfırlanamadı.");
    } finally {
      setResetting(false);
    }
  };

  const publicUrl = `${siteUrl}/${profile.username || "kullaniciadi"}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Üst bar */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">
          {adminMode ? "Kartı Düzenle (Yönetici)" : "Kartımı Düzenle"}
        </h1>
        <div className="flex items-center gap-4">
          {adminMode ? (
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline"
            >
              <FaUsers /> Yönetici Paneli
            </Link>
          ) : (
            <>
              {isAdminEmail(user.email) && (
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline"
                >
                  <FaUsers /> Yönetici Paneli
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800"
              >
                <FaHouse /> Anasayfa
              </Link>
              <button
                onClick={() => auth && signOut(auth)}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800"
              >
                <FaRightFromBracket /> Çıkış
              </button>
            </>
          )}
        </div>
      </div>

      {adminMode && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            Yönetici olarak <strong>{profile.email || editUid}</strong>{" "}
            kullanıcısının kartını düzenliyorsun. Değişiklikler kaydedilince
            kullanıcının kartına yansır.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-amber-200 pt-3">
            <button
              type="button"
              onClick={resetCard}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <FaRotateLeft className={resetting ? "animate-spin" : ""} />
              {resetting ? "Sıfırlanıyor..." : "Kartı Sıfırla"}
            </button>
            <span className="text-xs text-amber-700">
              Ad-soyad, kullanıcı adı, e-posta ve telefon korunur; geri kalan tüm
              bilgiler ve istatistikler silinir.
            </span>
          </div>
        </div>
      )}

      {/* İstatistikler */}
      <StatsPanel key={statsKey} uid={editUid} />

      {/* Yayın & adres */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex items-center justify-between">
          <span className="font-medium text-zinc-800">Kart yayında</span>
          <input
            type="checkbox"
            checked={profile.published}
            onChange={(e) => set({ published: e.target.checked })}
            className="h-5 w-5 accent-violet-600"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-500">Adres:</span>
          <code className="rounded bg-zinc-100 px-2 py-1 text-violet-700">{publicUrl}</code>
          {profile.username && (
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-violet-700 hover:underline"
            >
              <FaUpRightFromSquare className="text-xs" /> Önizle
            </Link>
          )}
        </div>
      </div>

      {/* Temel bilgiler */}
      <Section title="Temel Bilgiler">
        <Field label="Kullanıcı adı (adres)">
          <input
            value={profile.username}
            onChange={(e) => set({ username: e.target.value })}
            placeholder="ornek-isim"
            className="input"
          />
          {usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
        </Field>
        <Field label="Ad Soyad">
          <input value={profile.fullName} onChange={(e) => set({ fullName: e.target.value })} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ünvan">
            <input value={profile.title} onChange={(e) => set({ title: e.target.value })} className="input" />
          </Field>
          <Field label="Şirket">
            <input value={profile.company} onChange={(e) => set({ company: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label="Hakkında (kısa açıklama)">
          <textarea
            value={profile.bio}
            onChange={(e) => set({ bio: e.target.value })}
            rows={2}
            className="input resize-none"
          />
        </Field>
        <Field label="Profil fotoğrafı">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoURL}
                  alt="Profil fotoğrafı"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-200"
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: profile.themeColor || "#6d28d9" }}
                >
                  {initials}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onPickPhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                <FaCamera className="text-zinc-500" />
                {uploading
                  ? "Yükleniyor..."
                  : profile.photoURL
                  ? "Fotoğrafı değiştir"
                  : "Fotoğraf yükle"}
              </button>
              {profile.photoURL && !uploading && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
                >
                  <FaTrash className="text-xs" /> Kaldır
                </button>
              )}
              <p className="text-xs text-zinc-400">JPG, PNG, WEBP — en fazla 5 MB</p>
            </div>
          </div>
          {photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
        </Field>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Tema rengi</span>
          <input
            type="color"
            value={profile.themeColor}
            onChange={(e) => set({ themeColor: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded border border-zinc-300"
          />
        </div>
      </Section>

      {/* vCard bilgileri */}
      <Section title="Rehbere Eklenecek Bilgiler (vCard)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefon">
            <input value={profile.phone} onChange={(e) => set({ phone: e.target.value })} className="input" />
          </Field>
          <Field label="E-posta">
            <input value={profile.email} onChange={(e) => set({ email: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label="Web sitesi">
          <input value={profile.website} onChange={(e) => set({ website: e.target.value })} className="input" />
        </Field>
      </Section>

      {/* Bağlantılar */}
      <Section title="Platformlar & Bağlantılar">
        {profile.links.length === 0 && (
          <p className="text-sm text-zinc-500">Henüz bağlantı yok. Aşağıdan ekleyin.</p>
        )}
        {profile.links.length > 1 && (
          <p className="mb-2 text-xs text-zinc-400">
            İpucu: Tutma kolundan ☰ sürükleyerek sırayı değiştirebilirsin.
          </p>
        )}
        <div className="space-y-3">
          {profile.links.map((link, i) => {
            const def = PLATFORMS[link.type];
            const Icon = def.icon;
            const isDragging = dragIndex === i;
            const isOver = overIndex === i && dragIndex !== i;
            return (
              <div
                key={link.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`rounded-lg border p-3 transition ${
                  isDragging ? "opacity-40" : ""
                } ${isOver ? "border-violet-400 ring-2 ring-violet-200" : "border-zinc-200"}`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    title="Sürükleyerek sırala"
                    className="cursor-grab p-1 text-zinc-400 hover:text-zinc-700 active:cursor-grabbing"
                  >
                    <FaGripVertical />
                  </button>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: def.color }}
                  >
                    <Icon className="text-sm" />
                  </span>
                  <span className="flex-1 font-medium text-zinc-700">{def.label}</span>
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => moveLink(i, 1)}
                    disabled={i === profile.links.length - 1}
                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  >
                    <FaArrowDown />
                  </button>
                  <button onClick={() => removeLink(link.id)} className="p-1 text-red-400 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
                <input
                  value={link.value}
                  onChange={(e) => updateLink(link.id, { value: e.target.value })}
                  placeholder={def.placeholder}
                  className="input mt-2"
                />
                {link.type === "iban" && (
                  <input
                    value={link.label || ""}
                    onChange={(e) => updateLink(link.id, { label: e.target.value })}
                    placeholder="Banka adı (ör. Ziraat Bankası)"
                    className="input mt-2"
                  />
                )}
                {link.type === "custom" && (
                  <input
                    value={link.label || ""}
                    onChange={(e) => updateLink(link.id, { label: e.target.value })}
                    placeholder="Bağlantı adı (ör. Menü, Katalog)"
                    className="input mt-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Platform ekle */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-600">Platform ekle:</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_LIST.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => addLink(p.id)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:border-violet-400 hover:bg-violet-50"
                >
                  <Icon style={{ color: p.color }} /> {p.label}
                  <FaPlus className="text-xs text-zinc-400" />
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Hesap & güvenlik (sadece kendi kartında) */}
      {!adminMode && (
        <Section title="Şifre Değiştir">
          <ChangePassword user={user} />
        </Section>
      )}

      {/* Kaydet & NFC */}
      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center gap-3 border-t border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-lg bg-violet-700 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <Link
          href="/dashboard/nfc"
          className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <FaWifi /> NFC&apos;ye Yaz
        </Link>
      </div>
      {status && <p className="mt-3 text-center text-sm font-medium text-zinc-700">{status}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 font-bold text-zinc-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-600">{label}</span>
      {children}
    </label>
  );
}
