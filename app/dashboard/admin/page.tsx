"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaTrash,
  FaUpRightFromSquare,
  FaMagnifyingGlass,
  FaUsers,
  FaPen,
  FaPlus,
} from "react-icons/fa6";
import { useAuth } from "@/components/AuthProvider";
import { isAdminEmail } from "@/lib/admin";
import {
  getAllProfiles,
  deleteProfileByUid,
  setProfilePublished,
} from "@/lib/profiles";
import type { Profile } from "@/lib/types";

export default function AdminPage() {
  const { user, loading, configured } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");

  const admin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!admin) return;
    getAllProfiles()
      .then(setProfiles)
      .finally(() => setBusy(false));
  }, [admin]);

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
          <p className="text-sm text-zinc-500">
            Bu sayfa yalnızca süper yöneticiler içindir.
          </p>
          <Link href="/dashboard" className="text-violet-700 underline">
            Panele dön
          </Link>
        </div>
      </Centered>
    );

  const toggle = async (p: Profile) => {
    await setProfilePublished(p.uid, !p.published);
    setProfiles((list) =>
      list.map((x) => (x.uid === p.uid ? { ...x, published: !p.published } : x))
    );
  };

  const remove = async (p: Profile) => {
    if (!confirm(`"${p.fullName || p.username}" kartı silinsin mi? Bu işlem geri alınamaz.`))
      return;
    await deleteProfileByUid(p.uid);
    setProfiles((list) => list.filter((x) => x.uid !== p.uid));
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.username?.toLowerCase().includes(q) ||
      p.fullName?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <FaArrowLeft /> Panele dön
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <FaUsers />
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-zinc-900">Yönetici Paneli</h1>
          <p className="text-sm text-zinc-500">{profiles.length} kayıtlı kart</p>
        </div>
        <Link
          href="/dashboard/admin/new"
          className="flex items-center gap-2 rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
        >
          <FaPlus /> Yeni Kart
        </Link>
      </div>

      {/* Arama */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
        <FaMagnifyingGlass className="text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim, kullanıcı adı, şirket veya e-posta ara..."
          className="w-full py-2.5 outline-none"
        />
      </div>

      {busy ? (
        <p className="py-10 text-center text-zinc-500">Kartlar yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">Kayıt bulunamadı.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.uid}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3"
            >
              {/* Avatar */}
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: p.themeColor || "#6d28d9" }}
              >
                {(p.fullName || p.username || "?").slice(0, 2).toUpperCase()}
              </span>

              {/* Bilgi */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-800">
                  {p.fullName || "(isimsiz)"}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  /{p.username} · {p.email || "—"}
                  {p.company ? ` · ${p.company}` : ""}
                </p>
              </div>

              {/* Yayın rozeti / aç-kapat */}
              <button
                onClick={() => toggle(p)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  p.published
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
                title="Yayın durumunu değiştir"
              >
                {p.published ? "Yayında" : "Kapalı"}
              </button>

              {/* Düzenle */}
              <Link
                href={`/dashboard/admin/${p.uid}`}
                className="shrink-0 p-2 text-zinc-400 hover:text-violet-700"
                title="Kartı düzenle"
              >
                <FaPen />
              </Link>

              {/* Aç */}
              <Link
                href={`/${p.username}`}
                target="_blank"
                className="shrink-0 p-2 text-zinc-400 hover:text-violet-700"
                title="Kartı aç"
              >
                <FaUpRightFromSquare />
              </Link>

              {/* Sil */}
              <button
                onClick={() => remove(p)}
                className="shrink-0 p-2 text-red-400 hover:text-red-600"
                title="Kartı sil"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
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
