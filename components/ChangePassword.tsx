"use client";

import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from "firebase/auth";

export default function ChangePassword({ user }: { user: User }) {
  // Yalnızca e-posta/şifre ile açılmış hesaplarda şifre değiştirilebilir
  const hasPassword = user.providerData.some((p) => p.providerId === "password");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!hasPassword) {
    return (
      <p className="text-sm text-zinc-500">
        Bu hesap Google ile giriş yapıyor. Şifre, Google hesabınız üzerinden yönetilir.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (next.length < 6) {
      setMsg({ ok: false, text: "Yeni şifre en az 6 karakter olmalı." });
      return;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: "Yeni şifreler eşleşmiyor." });
      return;
    }

    setBusy(true);
    try {
      // Şifre değişikliği için yakın zamanlı giriş gerekir: önce doğrula
      const cred = EmailAuthProvider.credential(user.email || "", current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, next);
      setMsg({ ok: true, text: "✓ Şifreniz güncellendi." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({ ok: false, text: mesaj(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        required
        autoComplete="current-password"
        placeholder="Mevcut şifre"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className="input"
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Yeni şifre (en az 6 karakter)"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        className="input"
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Yeni şifre (tekrar)"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="input"
      />
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
      >
        {busy ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}

function mesaj(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Mevcut şifre hatalı.",
    "auth/wrong-password": "Mevcut şifre hatalı.",
    "auth/weak-password": "Yeni şifre çok zayıf (en az 6 karakter).",
    "auth/requires-recent-login": "Güvenlik için lütfen çıkış yapıp tekrar giriş yapın.",
    "auth/too-many-requests": "Çok fazla deneme. Bir süre sonra tekrar deneyin.",
  };
  return map[code] || "Şifre güncellenemedi. Tekrar deneyin.";
}
