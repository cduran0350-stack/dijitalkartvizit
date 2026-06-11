"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { FaWifi, FaArrowLeft, FaCircleCheck, FaTriangleExclamation } from "react-icons/fa6";
import { useAuth } from "@/components/AuthProvider";
import { getProfileByUid } from "@/lib/profiles";

// Web NFC tip tanımı (tarayıcı global'i)
declare global {
  interface Window {
    NDEFReader?: new () => {
      write: (message: { records: { recordType: string; data: string }[] }) => Promise<void>;
    };
  }
}

type WriteState = "idle" | "writing" | "done" | "error";

export default function NfcPage() {
  const { user, loading, configured } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<WriteState>("idle");
  const [message, setMessage] = useState("");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const cardUrl = username ? `${siteUrl}/${username}` : "";

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "NDEFReader" in window);
  }, []);

  useEffect(() => {
    if (user) getProfileByUid(user.uid).then((p) => setUsername(p?.username || null));
  }, [user]);

  const writeTag = async () => {
    if (!window.NDEFReader || !cardUrl) return;
    setState("writing");
    setMessage("Kartı telefonun arkasına yaklaştır...");
    try {
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: cardUrl }] });
      setState("done");
      setMessage("✓ Kart başarıyla programlandı! Artık dokununca profilin açılacak.");
    } catch (e) {
      setState("error");
      setMessage("Yazılamadı: " + ((e as Error).message || "bilinmeyen hata"));
    }
  };

  if (!configured) {
    return <Centered>Firebase bağlı değil. Önce .env.local dosyasını doldurun.</Centered>;
  }
  if (loading) return <Centered>Yükleniyor...</Centered>;
  if (!user) {
    return (
      <Centered>
        <Link href="/dashboard" className="text-violet-700 underline">
          Önce giriş yapın
        </Link>
      </Centered>
    );
  }
  if (!username) {
    return (
      <Centered>
        Önce kartınızı kaydedin.{" "}
        <Link href="/dashboard" className="text-violet-700 underline">
          Panele dön
        </Link>
      </Centered>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500">
        <FaArrowLeft /> Panele dön
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">NFC Karta Yaz</h1>
      <p className="mt-2 text-zinc-600">
        Kartının çipine profil adresin yazılır. Bilgini sonra güncellesen bile bu
        adres aynı kalır — kartı tekrar yazmana gerek olmaz.
      </p>

      <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-center text-sm">
        Yazılacak adres: <code className="text-violet-700">{cardUrl}</code>
      </div>

      {/* NFC yazma */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <FaWifi className="mx-auto text-4xl text-violet-600" />
        <h2 className="mt-3 font-bold text-zinc-900">NFC ile Yaz</h2>

        {supported ? (
          <>
            <button
              onClick={writeTag}
              disabled={state === "writing"}
              className="mt-4 w-full rounded-xl bg-violet-700 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
            >
              {state === "writing" ? "Kartı yaklaştır..." : "Karta Yazmaya Başla"}
            </button>
            {message && (
              <p
                className={`mt-3 flex items-center justify-center gap-2 text-sm ${
                  state === "done" ? "text-green-600" : state === "error" ? "text-red-600" : "text-zinc-600"
                }`}
              >
                {state === "done" && <FaCircleCheck />}
                {state === "error" && <FaTriangleExclamation />}
                {message}
              </p>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            <FaTriangleExclamation className="mx-auto mb-2 text-lg" />
            Bu tarayıcı NFC yazmayı desteklemiyor. Web NFC sadece{" "}
            <strong>Android + Chrome</strong> üzerinde ve <strong>https</strong> adreste çalışır.
            Telefonunuzdan Chrome ile bu sayfayı açıp tekrar deneyin. (iPhone Web NFC
            yazmayı desteklemez — alttaki QR yöntemini ya da &quot;NFC Tools&quot;
            uygulamasını kullanın.)
          </div>
        )}
      </div>

      {/* QR yedek */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <h2 className="font-bold text-zinc-900">QR Kod</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-500">
          NFC olmayan telefonlar bu kodu okutarak kartına ulaşır.
        </p>
        <div className="inline-block rounded-xl bg-white p-3 shadow">
          <QRCodeCanvas value={cardUrl} size={180} />
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-zinc-600">
      <div>{children}</div>
    </div>
  );
}
