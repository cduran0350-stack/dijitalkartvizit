import type { Metadata } from "next";
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

  const titleLine = [profile.title, profile.company].filter(Boolean).join(" · ");
  const description = profile.bio || titleLine || "Dijital kartvizit";

  // WhatsApp başlığında, referans paylaşımdaki gibi isim + marka etiketi görünür:
  // "Ayşe Nur Çevik (Dijital Kartvizit)"
  const shareTitle = `${profile.fullName} (Dijital Kartvizit)`;

  // og:image mutlak URL olmalı (WhatsApp JS çalıştırmaz, ham HTML'i okur).
  // Fotoğraf yoksa kapak görselini, o da yoksa hiçbirini kullanma.
  const imageUrl = profile.photoURL || profile.coverURL;
  const images = imageUrl
    ? [{ url: imageUrl, width: 1200, height: 1200, alt: profile.fullName }]
    : [];

  return {
    title: shareTitle,
    description,
    openGraph: {
      type: "profile",
      title: shareTitle,
      description,
      url: `/${profile.username}`,
      siteName: "Dijital Kartvizit",
      locale: "tr_TR",
      images,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: shareTitle,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <CardView username={decodeURIComponent(username)} />;
}
