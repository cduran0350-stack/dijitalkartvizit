"use client";

import { useState } from "react";
import {
  updatePassword,
  signOut,
  type User,
} from "firebase/auth";
import { FaLock, FaEye, FaEyeSlash, FaRightFromBracket } from "react-icons/fa6";
import { auth } from "@/lib/firebase";
import { setMustChangePassword } from "@/lib/profiles";

const DEFAULT_PASSWORD = "123456";

/**
 * İlk girişte zorunlu şifre değiştirme ekranı.
 * Kullanıcı yeni bir şifre belirlemeden başka hiçbir şey yapamaz.
 */
export default function ForcePasswordChange({
  user,
  onDone,
}: {
  user: User;
  onDone: () => void;
}) {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (next.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (next === DEFAULT_PASSWORD) {
      setError("Lütfen 123456 dışında bir şifre belirleyin.");
      return;
    }
    if (next !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setBusy(true);
    try {
      // Kullanıcı yeni giriş yaptığı için doğrudan değiştirilebilir
      await updatePassword(user, next);
      await setMustChangePassword(user.uid, false);
      onDone();
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/requires-recent-login") {
        setError(
          "Güvenlik için lütfen çıkış yapıp 123456 ile tekrar giriş yapın, sonra şifrenizi değiştirin."
        );
      } else if (code === "auth/weak-password") {
        setError("Yeni şifre çok zayıf (en az 6 karakter).");
      } else {
        setError("Şifre güncellenemedi. Tekrar deneyin.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <FaLock />
          </span>
          <h1 className="text-xl font-bold text-zinc-900">Şifrenizi Belirleyin</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Hesabınız <strong>123456</strong> başlangıç şifresiyle açıldı. Devam
            etmek için yeni bir şifre oluşturmanız gerekiyor.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Yeni şifre (en az 6 karakter)"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="input pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-700"
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <input
            type={show ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Yeni şifre (tekrar)"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-violet-700 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
          >
            {busy ? "Kaydediliyor..." : "Şifreyi Belirle ve Devam Et"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => auth && signOut(auth)}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-700"
        >
          <FaRightFromBracket /> Çıkış yap
        </button>
      </div>
    </div>
  );
}
