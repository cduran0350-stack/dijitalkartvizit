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
  const images = profile.photoURL ? [{ url: profile.photoURL, alt: profile.fullName }] : [];

  return {
    title: profile.fullName,
    description,
    openGraph: {
      type: "profile",
      title: profile.fullName,
      description,
      images,
    },
    twitter: {
      card: "summary",
      title: profile.fullName,
      description,
      images: profile.photoURL ? [profile.photoURL] : [],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <CardView username={decodeURIComponent(username)} />;
}
