"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { isAdminEmail } from "@/lib/admin";
import Editor from "@/components/Editor";

export default function AdminEditPage() {
  const { user, loading, configured } = useAuth();
  const params = useParams();
  const raw = Array.isArray(params.uid) ? params.uid[0] : params.uid;

  // "new" ise yeni bir kart kimliği üret (girişe bağlı olmayan, yönetici kartı)
  const targetUid = useMemo(() => {
    if (raw === "new") {
      const rnd = Math.floor(performance.now() * 1000).toString(36);
      return `card_${rnd}`;
    }
    return raw || "";
  }, [raw]);

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
  if (!isAdminEmail(user.email))
    return (
      <Centered>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-zinc-800">Yetkin yok</p>
          <Link href="/dashboard" className="text-violet-700 underline">
            Panele dön
          </Link>
        </div>
      </Centered>
    );

  return (
    <div className="min-h-screen bg-zinc-50">
      <Editor user={user} adminEditUid={targetUid} />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-zinc-600">
      <div>{children}</div>
    </div>
  );
}
