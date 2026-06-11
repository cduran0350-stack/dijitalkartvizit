"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import Editor from "@/components/Editor";

export default function DashboardPage() {
  const { user, loading, configured } = useAuth();

  if (!configured) {
    return (
      <div className="mx-auto mt-20 max-w-lg px-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Firebase bağlı değil</h1>
        <p className="mt-3 text-zinc-600">
          Panelin çalışması için <code className="rounded bg-zinc-100 px-1">.env.local</code>{" "}
          dosyasına Firebase bilgilerini girip sunucuyu yeniden başlatın.
        </p>
        <Link href="/" className="mt-5 inline-block text-violet-700 hover:underline">
          ← Ana sayfa
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {user ? <Editor user={user} /> : <LoginForm />}
    </div>
  );
}
