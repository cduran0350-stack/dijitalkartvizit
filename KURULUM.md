# Dijital Kartvizit — Kurulum

NFC destekli, çok kullanıcılı dijital kartvizit uygulaması. Next.js + Firebase.

## Çalıştırma

```bash
npm run dev
```

Tarayıcıda: http://localhost:3000

- `/` → tanıtım sayfası
- `/demo` → örnek kart (Firebase olmadan da çalışır)
- `/dashboard` → giriş + kart düzenleme paneli
- `/dashboard/nfc` → NFC'ye yazma + QR kod
- `/<kullaniciadi>` → herkese açık kart sayfası

## Firebase Bağlama

1. https://console.firebase.google.com → yeni proje.
2. Web uygulaması ekle (`</>`), çıkan `firebaseConfig` değerlerini `.env.local` dosyasına yaz:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Authentication** → Email/Password (ve istersen Google) etkinleştir.
4. **Firestore Database** oluştur. Kurallar (`firestore.rules` içeriği) → Rules sekmesine yapıştır.
5. **Storage** oluştur. Kurallar (`storage.rules` içeriği) → Rules sekmesine yapıştır.
6. `.env.local` değiştiğinde sunucuyu yeniden başlat (`Ctrl+C`, sonra `npm run dev`).

## NFC Nasıl Çalışır?

- Karta **profil adresin** (URL) yazılır, tüm veri değil.
- Bilgini panelden güncellersin; adres sabit kaldığı için **kartı tekrar yazmana gerek yoktur**.
- Web NFC yazma: yalnızca **Android + Chrome + https**. (iPhone Web NFC yazmaz; "NFC Tools" uygulaması ya da QR kullanılır.)
- Test için telefonla denemek istersen siteyi internete açman (deploy) gerekir; `localhost` NFC için yeterli değildir.

## Yayına Alma (Vercel önerilir)

```bash
npm run build
```

Vercel'e bağla, `.env.local` değişkenlerini Vercel ortam değişkenlerine ekle,
`NEXT_PUBLIC_SITE_URL` değerini gerçek alan adınla güncelle.
