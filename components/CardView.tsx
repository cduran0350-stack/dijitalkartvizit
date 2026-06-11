"use client";

import { useEffect, useState } from "react";
import { FaDownload, FaShareNodes } from "react-icons/fa6";
import type { Profile } from "@/lib/types";
import { PLATFORMS } from "@/lib/platforms";
import { getProfileByUsername } from "@/lib/profiles";
import { downloadVCard } from "@/lib/vcard";
import { logEvent } from "@/lib/analytics";

export default function CardView({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    getProfileByUsername(username)
      .then((p) => {
        setProfile(p);
        // Ziyareti kaydet — oturum başına bir kez (yenilemede şişmesin)
        if (p && p.published) {
          const key = `viewed_${p.uid}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            logEvent(p.uid, "view");
          }
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
      </div>
    );
  }

  if (!profile || !profile.published) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-100 p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-800">Kart bulunamadı</h1>
        <p className="text-zinc-500">
          &quot;{username}&quot; adlı bir dijital kart yok ya da yayında değil.
        </p>
        <a href="/" className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-white">
          Kendi kartını oluştur
        </a>
      </div>
    );
  }

  const theme = profile.themeColor || "#6d28d9";
  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const share = async () => {
    const url = window.location.href;
    // Paylaşım mesajının gövdesinde isim + ünvan da yer alsın
    const titleLine = [profile.title, profile.company].filter(Boolean).join(" · ");
    const text = titleLine
      ? `${profile.fullName} — ${titleLine}\nDijital kartvizit:`
      : `${profile.fullName}\nDijital kartvizit:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.fullName, text, url });
      } catch {
        /* iptal edildi */
      }
    } else {
      copy(`${text} ${url}`, "share");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 pb-12">
      <div className="mx-auto max-w-md">
        {/* Kapak + renk bandı */}
        <div
          className="h-36 w-full"
          style={{
            background: profile.coverURL
              ? `url(${profile.coverURL}) center/cover`
              : `linear-gradient(135deg, ${theme}, ${theme}99)`,
          }}
        />

        <div className="relative -mt-16 px-5">
          {/* Profil fotoğrafı */}
          <div className="flex justify-center">
            {profile.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoURL}
                alt={profile.fullName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white text-4xl font-bold text-white shadow-lg"
                style={{ backgroundColor: theme }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* İsim & ünvan */}
          <div className="mt-3 text-center">
            <h1 className="text-2xl font-bold text-zinc-900">{profile.fullName}</h1>
            {profile.title && <p className="text-zinc-600">{profile.title}</p>}
            {profile.company && (
              <p className="font-medium" style={{ color: theme }}>
                {profile.company}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm text-zinc-500">{profile.bio}</p>
            )}
          </div>

          {/* Ana aksiyonlar */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                logEvent(profile.uid, "contact");
                downloadVCard(profile);
              }}
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-md transition active:scale-95"
              style={{ backgroundColor: theme }}
            >
              <FaDownload /> Rehbere Ekle
            </button>
            <button
              onClick={share}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white py-3 font-semibold text-zinc-700 shadow-sm transition active:scale-95"
            >
              <FaShareNodes /> Paylaş
            </button>
          </div>

          {/* Platform bağlantıları — soft gri tonlu kutucuklar, sadece logolar */}
          <div className="mt-6 grid grid-cols-4 gap-3 min-[380px]:gap-4 sm:grid-cols-5">
            {profile.links.map((link) => {
              const def = PLATFORMS[link.type];
              if (!def || !link.value) return null;
              const Icon = def.icon;
              const label = link.label || def.label;
              const isCopyOnly = link.type === "iban";

              const cell = (
                <span className="flex aspect-square w-full items-center justify-center rounded-2xl border border-zinc-200/70 bg-gradient-to-b from-white to-zinc-100 text-zinc-500 shadow-sm transition active:scale-95 active:text-zinc-700 hover:to-zinc-50 hover:text-zinc-700">
                  <Icon className="text-[22px] min-[380px]:text-2xl sm:text-[26px]" />
                </span>
              );

              if (isCopyOnly) {
                return (
                  <button
                    key={link.id}
                    onClick={() => copy(link.value, link.id)}
                    title={label}
                    aria-label={`${label} kopyala`}
                    className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    {cell}
                  </button>
                );
              }

              return (
                <a
                  key={link.id}
                  href={def.href(link.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  {cell}
                </a>
              );
            })}
          </div>

          {/* Kopyalama bildirimi */}
          {copied && (
            <p className="mt-3 text-center text-sm font-medium text-green-600">
              Panoya kopyalandı!
            </p>
          )}

          {/* Alt bilgi */}
          <p className="mt-8 text-center text-xs text-zinc-400">
            Bu kart{" "}
            <a href="/" className="font-medium underline">
              Dijital Kartvizit
            </a>{" "}
            ile oluşturuldu
          </p>
        </div>
      </div>
    </div>
  );
}
