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

  // Başlığın altında açıklama (bio) yerine ünvan ve şirket alt alta görünsün.
  const description =
    [profile.title, profile.company].filter(Boolean).join("\n") || "Dijital kartvizit";

  // WhatsApp başlığında, referans paylaşımdaki gibi isim + marka etiketi görünür:
  // "Ayşe Nur Çevik (Dijital Kartvizit)"
  const shareTitle = `${profile.fullName} (Dijital Kartvizit)`;

  // Profil fotoğrafı Firestore'da data URL olarak tutulduğu için doğrudan
  // og:image yapılamaz (WhatsApp data URL'i çekemez). Bunun yerine fotoğrafı
  // gerçek bir resim olarak servis eden /og/[username] uç noktasını gösteriyoruz.
  // metadataBase ile mutlak adrese çözülür.
  const ogImage = `/og/${encodeURIComponent(profile.username)}`;

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
