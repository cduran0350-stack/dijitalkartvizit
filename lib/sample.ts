import type { Profile } from "./types";

/** Firebase bağlanana kadar gösterilecek demo profil */
export const sampleProfile: Profile = {
  uid: "demo",
  username: "demo",
  published: true,
  fullName: "Ayşe Nur Çevik",
  title: "Kurucu & Genel Müdür",
  company: "Business Touch",
  bio: "Dijital kartvizit çözümleri. Tek dokunuşla tüm iletişim bilgileriniz.",
  photoURL: "",
  themeColor: "#6d28d9",
  email: "info@ornek.com",
  phone: "+90 555 123 45 67",
  website: "https://ornek.com",
  links: [
    { id: "1", type: "tel", value: "+90 555 123 45 67" },
    { id: "2", type: "whatsapp", value: "+90 555 123 45 67" },
    { id: "3", type: "email", value: "info@ornek.com" },
    { id: "4", type: "website", value: "https://ornek.com" },
    { id: "5", type: "instagram", value: "ornekhesap" },
    { id: "6", type: "linkedin", value: "in/ornek" },
    { id: "7", type: "x", value: "ornekhesap" },
    { id: "8", type: "youtube", value: "@ornekkanal" },
    { id: "9", type: "maps", value: "Levent, İstanbul" },
  ],
  updatedAt: 0,
};
