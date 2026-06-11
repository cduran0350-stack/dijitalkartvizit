"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa6";
import { useAuth } from "@/components/AuthProvider";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/firebase";
import { createUserAccount, authHataMesaji } from "@/lib/adminUsers";
import { saveProfile, getProfileByEmail } from "@/lib/profiles";
import type { Profile } from "@/lib/types";

// Yönetici tarafından açılan her hesabın varsayılan şifresi.
// Kullanıcı ilk girişte bunu değiştirmek zorundadır.
const DEFAULT_PASSWORD = "123456";

export default function NewUserPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const admin = isAdminEmail(user?.email);

  if (!configured) return <Centered>Firebase bağlı değil.</Centered>;
  if (loading) return <Centered>Yükleniyor...</Centered>;
  if (!user)
    return (
      <Centered>
        <Link href="/dashboard" className="text-violet-700 underline">
          Önce giriş yapın
        </Link>
      </Centered>
    );
  if (!admin)
    return (
      <Centered>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-zinc-800">Yetkin yok</p>
          <Link href="/dashboard/admin" className="text-violet-700 underline">
            Panele dön
          </Link>
        </div>
      </Centered>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const mail = email.trim().toLowerCase();
    if (!mail) {
      setError("E-posta gerekli.");
      return;
    }

    setBusy(true);
    try {
      // 1) Kişi için giriş hesabı oluştur (yöneticinin oturumu bozulmaz).
      //    Şifre otomatik olarak 123456; kullanıcı ilk girişte değiştirecek.
      let uid: string;
      try {
        uid = await createUserAccount(mail, DEFAULT_PASSWORD);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code !== "auth/email-already-in-use") throw err;

        // E-posta Firebase'de kayıtlı. Aktif bir kart var mı?
        const existing = await getProfileByEmail(mail);
        if (existing) {
          setError("Bu e-posta zaten kayıtlı (aktif bir kart mevcut).");
          setBusy(false);
          return;
        }

        // Kart yok = yetim giriş hesabı (kartı önceden silinmiş).
        // Sunucuda bu hesabı temizleyip yeniden oluşturmayı dene.
        const idToken = await auth?.currentUser?.getIdToken();
        const res = await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, email: mail }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(
            data.error === "not-configured"
              ? "Bu e-posta Firebase'de kalmış; serbest bırakmak için sunucu anahtarı (FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL) gerekli. Vercel ortam değişkenlerini ekleyince çalışır."
              : "E-posta serbest bırakılamadı. Tekrar deneyin."
          );
          setBusy(false);
          return;
        }
        // Temizlendi → yeniden oluştur
        uid = await createUserAccount(mail, DEFAULT_PASSWORD);
      }

      // 2) Bu uid için başlangıç kartı (profil) oluştur.
      //    Giriş e-postası = rehbere eklenecek (vCard) e-posta.
      const profile: Profile = {
        uid,
        username: "",
        published: false,
        fullName: fullName.trim(),
        title: "",
        company: "",
        bio: "",
        photoURL: "",
        themeColor: "#6d28d9",
        email: mail,
        phone: "",
        website: "",
        links: [],
        mustChangePassword: true, // ilk girişte şifre değiştirme zorunlu
      };
      await saveProfile(profile);

      // 3) Kartın geri kalanını düzenlemek için editöre git
      router.replace(`/dashboard/admin/${uid}`);
    } catch (err) {
      setError(authHataMesaji(err));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/dashboard/admin"
        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <FaArrowLeft /> Yönetici paneline dön
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <FaUserPlus />
        </span>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Yeni Kart / Kullanıcı</h1>
          <p className="text-sm text-zinc-500">
            Kişinin e-postasını girin. Şifre otomatik <strong>123456</strong> olur;
            kişi ilk girişte kendi şifresini belirlemek zorundadır.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <Field label="Ad Soyad (isteğe bağlı)">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ör. Ahmet Yılmaz"
            className="input"
          />
        </Field>

        <Field label="Giriş e-postası (rehbere eklenecek e-posta)">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kisi@ornek.com"
            className="input"
          />
        </Field>

        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800">
          Başlangıç şifresi: <strong>123456</strong>. Kişi bu şifreyle giriş yapar
          yapmaz yeni bir şifre belirlemek zorundadır.
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-violet-700 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
        >
          {busy ? "Oluşturuluyor..." : "Hesabı oluştur ve kartı düzenle"}
        </button>
        <p className="text-center text-xs text-zinc-400">
          Hesap oluşturulduktan sonra kart bilgilerini düzenleme ekranına
          yönlendirileceksiniz.
        </p>
      </form>
    </div>
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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-zinc-600">
      <div>{children}</div>
    </div>
  );
}
