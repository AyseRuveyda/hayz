# Hayz Takvimi (HayzApp)

Hayz, nifas ve istihâze takip platformu — Next.js 14, TypeScript, Tailwind CSS, PWA ve Supabase.

## Özellikler

- Fıkhi hesaplama motoru (Hanefî, Mâlikî, Hanbelî, taklit)
- Renk kodlu döngü takvimi
- Kaza namazı / oruç takibi
- İlmihal bilgi kartları
- Misafir modu (localStorage) + Supabase senkronizasyonu
- PWA ve Capacitor mobil hazırlığı

## Kurulum

```bash
npm install
cp .env.example .env.local
# Supabase URL ve anon key ekleyin (isteğe bağlı)
npm run dev
```

## Supabase

`supabase/schema.sql` dosyasını Supabase SQL Editor'de çalıştırın.

## Mobil / PWA

- `public/manifest.json` ve service worker (`public/sw.js`)
- Capacitor: `npm run cap:sync` (önce statik export yapılandırması gerekir)

## Saat girişi

Hesaplama formunda tarih ve **24 saat** formatında manuel saat (ör. `14:30`) kullanılır; öğleden önce/sonra gösterimi yoktur.
