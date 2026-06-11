// vCard (.vcf) üretimi — "Rehbere Ekle" için
import type { Profile } from "./types";
import { PLATFORMS } from "./platforms";

/** Profilden vCard 3.0 metni üretir */
export function buildVCard(profile: Profile): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${profile.fullName}`);
  // Soyad;Ad biçimi (basit ayrım)
  const parts = profile.fullName.trim().split(" ");
  const last = parts.length > 1 ? parts.pop() : "";
  lines.push(`N:${last};${parts.join(" ")};;;`);

  if (profile.company) lines.push(`ORG:${profile.company}`);
  if (profile.title) lines.push(`TITLE:${profile.title}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`);
  if (profile.website) lines.push(`URL:${profile.website}`);
  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, "\\n")}`);

  // Sosyal bağlantıları URL olarak ekle
  for (const link of profile.links) {
    const def = PLATFORMS[link.type];
    if (!def) continue;
    if (["tel", "whatsapp", "email", "iban"].includes(link.type)) continue;
    const url = def.href(link.value);
    if (url.startsWith("http")) lines.push(`URL:${url}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** vCard'ı dosya olarak indir (tarayıcıda) */
export function downloadVCard(profile: Profile) {
  const vcard = buildVCard(profile);
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.username || "kartvizit"}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
