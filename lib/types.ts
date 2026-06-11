// Dijital kartvizit veri tipleri

export type LinkType =
  | "tel"
  | "whatsapp"
  | "email"
  | "url"
  | "instagram"
  | "linkedin"
  | "x"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "telegram"
  | "github"
  | "behance"
  | "dribbble"
  | "spotify"
  | "snapchat"
  | "pinterest"
  | "threads"
  | "discord"
  | "twitch"
  | "vimeo"
  | "medium"
  | "maps"
  | "website"
  | "iban"
  | "sahibinden"
  | "emlakjet"
  | "hepsiemlak"
  | "custom";

export interface CardLink {
  id: string; // benzersiz kimlik
  type: LinkType;
  /** Kullanıcı adı, telefon, e-posta veya tam URL */
  value: string;
  /** İsteğe bağlı görünen ad (varsayılanı ezmek için) */
  label?: string;
}

export interface Profile {
  /** Firebase Auth uid (sahibi) */
  uid: string;
  /** Herkese açık adres: /kullaniciadi */
  username: string;
  /** Yayında mı? false ise herkese açık görünmez */
  published: boolean;

  fullName: string;
  title?: string; // ünvan (ör. Genel Müdür)
  company?: string;
  bio?: string;

  photoURL?: string; // profil fotoğrafı
  coverURL?: string; // kapak görseli
  themeColor?: string; // ana renk (hex)

  links: CardLink[];

  // vCard / rehbere ekleme alanları
  email?: string;
  phone?: string;
  website?: string;

  updatedAt?: number;
}
