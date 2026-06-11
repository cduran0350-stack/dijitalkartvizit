// Tüm platformların kaydı: ikon, etiket, renk ve link üretimi
import type { IconType } from "react-icons";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaTelegram,
  FaGithub,
  FaBehance,
  FaDribbble,
  FaSpotify,
  FaSnapchat,
  FaPinterest,
  FaThreads,
  FaDiscord,
  FaTwitch,
  FaVimeo,
  FaMedium,
  FaLocationDot,
  FaLink,
  FaBuildingColumns,
  FaHouse,
  FaBuilding,
  FaHouseChimney,
} from "react-icons/fa6";
import type { LinkType } from "./types";

export interface PlatformDef {
  id: LinkType;
  label: string; // varsayılan görünen ad
  icon: IconType;
  color: string; // marka rengi
  /** Giriş alanı ipucu (kullanıcı paneli için) */
  placeholder: string;
  /** value -> tıklanabilir href üretir */
  href: (value: string) => string;
}

// Telefon/whatsapp için sadece rakamları al
const digits = (v: string) => v.replace(/[^\d+]/g, "");

// Kullanıcı adı mı tam URL mü? URL ise olduğu gibi kullan
const asUrl = (value: string, base: string) => {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return base + v.replace(/^@/, "");
};

export const PLATFORMS: Record<LinkType, PlatformDef> = {
  tel: {
    id: "tel",
    label: "Telefon",
    icon: FaPhone,
    color: "#16a34a",
    placeholder: "+90 555 000 00 00",
    href: (v) => `tel:${digits(v)}`,
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "#25D366",
    placeholder: "+90 555 000 00 00",
    href: (v) => `https://wa.me/${digits(v).replace(/^\+/, "")}`,
  },
  email: {
    id: "email",
    label: "E-posta",
    icon: FaEnvelope,
    color: "#ea4335",
    placeholder: "ad@ornek.com",
    href: (v) => `mailto:${v.trim()}`,
  },
  website: {
    id: "website",
    label: "Web Sitesi",
    icon: FaGlobe,
    color: "#0ea5e9",
    placeholder: "https://siteniz.com",
    href: (v) => asUrl(v, "https://"),
  },
  url: {
    id: "url",
    label: "Bağlantı",
    icon: FaLink,
    color: "#64748b",
    placeholder: "https://...",
    href: (v) => asUrl(v, "https://"),
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#E1306C",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://instagram.com/"),
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    color: "#0A66C2",
    placeholder: "in/kullaniciadi veya tam URL",
    href: (v) => asUrl(v, "https://linkedin.com/in/"),
  },
  x: {
    id: "x",
    label: "X (Twitter)",
    icon: FaXTwitter,
    color: "#000000",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://x.com/"),
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877F2",
    placeholder: "kullaniciadi veya tam URL",
    href: (v) => asUrl(v, "https://facebook.com/"),
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    color: "#FF0000",
    placeholder: "@kanal veya tam URL",
    href: (v) => asUrl(v, "https://youtube.com/"),
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    placeholder: "@kullaniciadi",
    href: (v) => asUrl(v.startsWith("@") ? v : "@" + v, "https://tiktok.com/"),
  },
  telegram: {
    id: "telegram",
    label: "Telegram",
    icon: FaTelegram,
    color: "#229ED9",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://t.me/"),
  },
  github: {
    id: "github",
    label: "GitHub",
    icon: FaGithub,
    color: "#181717",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://github.com/"),
  },
  behance: {
    id: "behance",
    label: "Behance",
    icon: FaBehance,
    color: "#1769FF",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://behance.net/"),
  },
  dribbble: {
    id: "dribbble",
    label: "Dribbble",
    icon: FaDribbble,
    color: "#EA4C89",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://dribbble.com/"),
  },
  spotify: {
    id: "spotify",
    label: "Spotify",
    icon: FaSpotify,
    color: "#1DB954",
    placeholder: "profil veya tam URL",
    href: (v) => asUrl(v, "https://open.spotify.com/"),
  },
  snapchat: {
    id: "snapchat",
    label: "Snapchat",
    icon: FaSnapchat,
    color: "#FFFC00",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://snapchat.com/add/"),
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    icon: FaPinterest,
    color: "#E60023",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://pinterest.com/"),
  },
  threads: {
    id: "threads",
    label: "Threads",
    icon: FaThreads,
    color: "#000000",
    placeholder: "@kullaniciadi",
    href: (v) => asUrl(v.startsWith("@") ? v : "@" + v, "https://threads.net/"),
  },
  discord: {
    id: "discord",
    label: "Discord",
    icon: FaDiscord,
    color: "#5865F2",
    placeholder: "davet linki veya kullanıcı",
    href: (v) => asUrl(v, "https://discord.com/users/"),
  },
  twitch: {
    id: "twitch",
    label: "Twitch",
    icon: FaTwitch,
    color: "#9146FF",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://twitch.tv/"),
  },
  vimeo: {
    id: "vimeo",
    label: "Vimeo",
    icon: FaVimeo,
    color: "#1AB7EA",
    placeholder: "kullaniciadi",
    href: (v) => asUrl(v, "https://vimeo.com/"),
  },
  medium: {
    id: "medium",
    label: "Medium",
    icon: FaMedium,
    color: "#000000",
    placeholder: "@kullaniciadi",
    href: (v) => asUrl(v.startsWith("@") ? v : "@" + v, "https://medium.com/"),
  },
  maps: {
    id: "maps",
    label: "Konum",
    icon: FaLocationDot,
    color: "#34A853",
    placeholder: "Adres veya harita linki",
    href: (v) =>
      /^https?:\/\//i.test(v)
        ? v
        : `https://maps.google.com/?q=${encodeURIComponent(v)}`,
  },
  iban: {
    id: "iban",
    label: "IBAN",
    icon: FaBuildingColumns,
    color: "#475569",
    placeholder: "TR00 0000 0000 0000 0000 0000 00",
    href: (v) => `#${v.replace(/\s/g, "")}`, // kopyalanır, açılmaz
  },
  sahibinden: {
    id: "sahibinden",
    label: "Sahibinden",
    icon: FaHouse,
    color: "#ffb800",
    placeholder: "Mağaza/ilan linki veya kullanıcı adı",
    href: (v) => asUrl(v, "https://www.sahibinden.com/"),
  },
  emlakjet: {
    id: "emlakjet",
    label: "Emlakjet",
    icon: FaBuilding,
    color: "#ff5a00",
    placeholder: "Profil/ilan linki",
    href: (v) => asUrl(v, "https://www.emlakjet.com/"),
  },
  hepsiemlak: {
    id: "hepsiemlak",
    label: "Hepsiemlak",
    icon: FaHouseChimney,
    color: "#e2001a",
    placeholder: "Profil/ilan linki",
    href: (v) => asUrl(v, "https://www.hepsiemlak.com/"),
  },
  custom: {
    id: "custom",
    label: "Özel Bağlantı",
    icon: FaLink,
    color: "#6366f1",
    placeholder: "https://...",
    href: (v) => asUrl(v, "https://"),
  },
};

/** Panelde seçim için sıralı liste */
export const PLATFORM_LIST: PlatformDef[] = [
  PLATFORMS.tel,
  PLATFORMS.whatsapp,
  PLATFORMS.email,
  PLATFORMS.website,
  PLATFORMS.instagram,
  PLATFORMS.linkedin,
  PLATFORMS.x,
  PLATFORMS.facebook,
  PLATFORMS.youtube,
  PLATFORMS.tiktok,
  PLATFORMS.telegram,
  PLATFORMS.github,
  PLATFORMS.behance,
  PLATFORMS.dribbble,
  PLATFORMS.spotify,
  PLATFORMS.snapchat,
  PLATFORMS.pinterest,
  PLATFORMS.threads,
  PLATFORMS.discord,
  PLATFORMS.twitch,
  PLATFORMS.vimeo,
  PLATFORMS.medium,
  PLATFORMS.maps,
  PLATFORMS.sahibinden,
  PLATFORMS.emlakjet,
  PLATFORMS.hepsiemlak,
  PLATFORMS.iban,
  PLATFORMS.custom,
];
