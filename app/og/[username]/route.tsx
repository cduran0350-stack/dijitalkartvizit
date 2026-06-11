// WhatsApp/Telegram link önizlemesi için GERÇEK bir resim URL'i.
// Profil fotoğrafı Firestore'da data URL olarak tutulduğundan (Storage'sız),
// burada ham bayta çevirip image/jpeg olarak servis ediyoruz. Fotoğraf yoksa
// markalı bir varsayılan kart üretiyoruz.

import { ImageResponse } from "next/og";
import { getProfileByUsername } from "@/lib/profiles";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
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
    return new Response(bytes, {
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

  // 3) Fotoğraf yok → markalı varsayılan kart
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 80, fontWeight: 800, letterSpacing: -2 }}>
          Dijital Kartvizit
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 32, opacity: 0.85 }}>
          NFC destekli dijital kartvizit
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
