// WhatsApp/Telegram link önizlemesi için GERÇEK bir resim URL'i.
// Profil fotoğrafı Firestore'da data URL olarak tutulduğundan (Storage'sız),
// burada ham bayta çevirip image/jpeg olarak servis ediyoruz. Fotoğraf yoksa
// markalı statik bir banner'a yönlendiriyoruz. (next/og kullanılmaz — her
// ortamda sorunsuz derlenir.)

import { getProfileByUsername } from "@/lib/profiles";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const profile = await getProfileByUsername(decodeURIComponent(username));
  const photo = profile?.photoURL || profile?.coverURL || "";

  // 1) data URL → ham baytları gerçek resim olarak döndür
  if (photo.startsWith("data:image")) {
    const comma = photo.indexOf(",");
    const mime = photo.slice(5, comma).split(";")[0] || "image/jpeg";
    const bytes = Buffer.from(photo.slice(comma + 1), "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  // 2) Dış URL (ileride Storage kullanılırsa) → ona yönlendir
  if (photo.startsWith("http")) {
    return Response.redirect(photo, 302);
  }

  // 3) Fotoğraf yok → markalı varsayılan banner
  return Response.redirect(new URL("/og-default.svg", req.url), 302);
}
