import type { MetadataRoute } from "next";

// Gerçek bir /robots.txt üretir. Olmadığında /robots.txt isteği [username]
// rotasına düşüp "Kart bulunamadı" HTML'i döndürüyordu ve link önizleme
// botları (facebookexternalhit/WhatsApp) için kafa karıştırıcıydı.
// Tüm botlara her şeye izin veriyoruz; link önizlemesi için gerekli.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
