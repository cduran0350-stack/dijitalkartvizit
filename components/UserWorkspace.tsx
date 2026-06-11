"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getProfileByUid } from "@/lib/profiles";
import Editor from "@/components/Editor";
import ForcePasswordChange from "@/components/ForcePasswordChange";

/**
 * Normal kullanıcı (danışman) çalışma alanı.
 * Profilinde mustChangePassword=true ise önce zorunlu şifre değiştirme
 * ekranını gösterir; aksi halde kart düzenleyiciyi açar.
 */
export default function UserWorkspace({ user }: { user: User }) {
  const [mustChange, setMustChange] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getProfileByUid(user.uid)
      .then((p) => {
        if (active) setMustChange(Boolean(p?.mustChangePassword));
      })
      .catch(() => {
        if (active) setMustChange(false);
      });
    return () => {
      active = false;
    };
  }, [user.uid]);

  if (mustChange === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-violet-600" />
      </div>
    );
  }

  if (mustChange) {
    return (
      <ForcePasswordChange user={user} onDone={() => setMustChange(false)} />
    );
  }

  return <Editor user={user} />;
}
