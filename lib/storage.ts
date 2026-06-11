// Profil fotoğrafı işleme — Firebase Storage GEREKTİRMEZ.
// Görsel tarayıcıda küçültülüp JPEG data URL olarak doğrudan Firestore'a kaydedilir.
// (Ücretsiz Spark planında çalışır; Storage/Blaze gerekmez.)

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // seçilebilecek en büyük dosya (küçültülmeden önce)
const MAX_DIM = 480; // küçültme sonrası en uzun kenar (px)
const QUALITY = 0.82;

/**
 * Profil fotoğrafını küçültüp data URL döndürür (Firestore'a yazılabilir, ~30-80 KB).
 * uid parametresi imza uyumu için tutuluyor; data URL yaklaşımında kullanılmaz.
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Yalnızca JPG, PNG, WEBP veya GIF yükleyebilirsiniz.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Dosya çok büyük (en fazla 8 MB).");
  }
  return resizeToDataUrl(file, MAX_DIM, QUALITY);
}

/** Data URL yaklaşımında silinecek dosya yok; alanı boşaltmak yeterli. */
export async function deleteProfilePhoto(_photoURL: string): Promise<void> {
  return;
}

/** Görseli canvas ile küçültüp JPEG data URL'e çevirir. */
function resizeToDataUrl(file: File, max: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (Math.max(width, height) > max) {
        if (width >= height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Görsel işlenemedi."));
        return;
      }
      // Şeffaf PNG'ler için beyaz arka plan
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        reject(new Error("Görsel dönüştürülemedi."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Görsel okunamadı. Başka bir dosya deneyin."));
    };

    img.src = objectUrl;
  });
}
