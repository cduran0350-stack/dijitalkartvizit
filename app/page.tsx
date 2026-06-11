import Link from "next/link";
import { FaBolt, FaIdCard, FaWifi } from "react-icons/fa6";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1 text-sm font-medium text-violet-700">
          <FaWifi /> NFC destekli dijital kartvizit
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900">
          Tek dokunuşla <span className="text-violet-700">tüm bilgileriniz</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
          Telefonu kartınıza dokundurun; tüm sosyal medya, iletişim ve ödeme
          bilgileriniz anında karşı tarafta görünsün. Güncellemek için tekrar
          kart bastırmanıza gerek yok.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-violet-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-violet-800"
          >
            Panele Giriş
          </Link>
          <Link
            href="/demo"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Örnek Kartı Gör
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { icon: FaIdCard, t: "Tüm Platformlar", d: "Instagram, LinkedIn, WhatsApp, IBAN ve dahası." },
            { icon: FaWifi, t: "NFC ile Tara", d: "Karta dokun, profil anında açılsın." },
            { icon: FaBolt, t: "Anında Güncelle", d: "Bilgini değiştir, kart aynı kalsın." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl bg-white p-6 text-left shadow-sm">
              <f.icon className="text-2xl text-violet-700" />
              <h3 className="mt-3 font-bold text-zinc-900">{f.t}</h3>
              <p className="mt-1 text-sm text-zinc-500">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
