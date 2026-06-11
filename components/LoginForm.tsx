"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { auth } from "@/lib/firebase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // "Sürekli açık tut" açıksa kalıcı, kapalıysa sadece bu oturum
  const applyPersistence = async () => {
    if (!auth) return;
    await setPersistence(
      auth,
      keepSignedIn ? browserLocalPersistence : browserSessionPersistence
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError(null);
    setBusy(true);
    try {
      await applyPersistence();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(mesaj(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-center text-2xl font-bold text-zinc-900">Giriş Yap</h1>
      <p className="mt-1 text-center text-sm text-zinc-500">
        Dijital kartını yönetmek için
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 pr-12 outline-none focus:border-violet-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-700"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
            className="h-4 w-4 accent-violet-600"
          />
          Sürekli açık tut (beni hatırla)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-violet-700 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
        >
          {busy ? "Lütfen bekleyin..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Hesabın yok mu? Yöneticiyle iletişime geç.
      </p>
    </div>
  );
}

function mesaj(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/user-not-found": "Bu e-posta ile kayıt yok.",
    "auth/wrong-password": "Şifre hatalı.",
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/too-many-requests": "Çok fazla deneme. Bir süre sonra tekrar deneyin.",
  };
  return map[code] || "Bir hata oluştu. Tekrar deneyin.";
}
