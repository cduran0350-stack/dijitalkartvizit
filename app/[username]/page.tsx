import type { Metadata } from "next";
import { headers } from "next/headers";
import CardView from "@/components/CardView";
import { getProfileByUsername } from "@/lib/profiles";

type Props = { params: Promise<{ username: string }> };

/**
 * Link önizlemesi için Open Graph etiketleri.
 * WhatsApp/Telegram/iMessage paylaşımında kartın isim-soyisim ve
 * profil fotoğrafı önizlemede görünür.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(decodeURIComponent(username));

  if (!profile || !profile.published) {
    return { title: "Kart bulunamadı" };
  }

  // Başlığın altında açıklama (bio) yerine ünvan ve şirket alt alta görünsün.
  const description =
    [profile.title, profile.company].filter(Boolean).join("\n") || "Dijital kartvizit";

  // WhatsApp başlığında, referans paylaşımdaki gibi isim + marka etiketi görünür:
  // "Ayşe Nur Çevik (Dijital Kartvizit)"
  const shareTitle = `${profile.fullName} (Dijital Kartvizit)`;

  // Mutlak adresi, sayfanın açıldığı GERÇEK alan adından üret. Böylece domain
  // değişse de (omega, sirket..., ileride kendi alan adın) og:image hep doğru
  // adresten gelir; sabit bir env değişkenine bağımlı kalmaz.
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_SITE_URL || "");

  // Profil fotoğrafı Firestore'da data URL olarak tutulduğu için doğrudan
  // og:image yapılamaz (WhatsApp data URL'i çekemez). Fotoğrafı gerçek bir
  // resim olarak servis eden /og/[username] uç noktasını gösteriyoruz.
  const ogImage = `${base}/og/${encodeURIComponent(profile.username)}`;
  const pageUrl = `${base}/${encodeURIComponent(profile.username)}`;

  return {
    title: shareTitle,
    description,
    openGraph: {
      type: "profile",
      title: shareTitle,
      description,
      url: pageUrl,
      siteName: "Dijital Kartvizit",
      locale: "tr_TR",
      images: [{ url: ogImage, alt: profile.fullName }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <CardView username={decodeURIComponent(username)} />;
}
