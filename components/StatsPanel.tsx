"use client";

import { useEffect, useState } from "react";
import { FaEye, FaAddressBook } from "react-icons/fa6";
import { getStats, type Stats } from "@/lib/analytics";

const PERIODS: { key: keyof Stats; label: string }[] = [
  { key: "day", label: "Bugün" },
  { key: "week", label: "Bu Hafta" },
  { key: "month", label: "Bu Ay" },
  { key: "year", label: "Bu Yıl" },
];

export default function StatsPanel({ uid }: { uid: string }) {
  const [views, setViews] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Stats | null>(null);

  useEffect(() => {
    getStats(uid, "view").then(setViews);
    getStats(uid, "contact").then(setContacts);
  }, [uid]);

  return (
    <div className="mb-6 space-y-4">
      <StatBlock
        icon={<FaEye />}
        title="Profil Ziyaretleri"
        stats={views}
        color="#6d28d9"
      />
      <StatBlock
        icon={<FaAddressBook />}
        title="Rehbere Eklenme"
        stats={contacts}
        color="#16a34a"
      />
    </div>
  );
}

function StatBlock({
  icon,
  title,
  stats,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  stats: Stats | null;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" style={{ color }}>
          {icon}
        </span>
        <h2 className="font-bold text-zinc-900">{title}</h2>
        {stats && (
          <span className="ml-auto text-sm text-zinc-400">
            Toplam: <strong className="text-zinc-700">{stats.total}</strong>
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PERIODS.map((p) => (
          <div
            key={p.key}
            className="rounded-lg bg-zinc-50 p-3 text-center"
          >
            <div className="text-2xl font-extrabold" style={{ color }}>
              {stats ? stats[p.key] : "—"}
            </div>
            <div className="mt-1 text-[11px] font-medium text-zinc-500">
              {p.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
