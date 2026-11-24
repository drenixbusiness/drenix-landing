# DRENIX — korporativ veb-sayt

Next.js 16 (App Router, Cache Components), Tailwind CSS v4, Lenis va Three.js asosidagi ko‘p sahifali sayt. Sayt matni ingliz tilida.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Sahifalar

| Yo‘l | Tavsif |
|---|---|
| `/` | Bosh sahifa: kampus → minora → tanlangan qavat → ofis → xonama-xona sayohat, keyin bo‘limlar, jarayon, loyihalar, ariza |
| `/services` | Barcha 10 ta bo‘lim |
| `/services/[slug]` | Bo‘lim sahifasi: ochiq qavat rasmi, kim ishlaydi, 6 ta xona bo‘ylab 3D sayohat (`#rooms`), narsalar va savollar |
| `/startups` | DRENIX Launchpad dasturi |
| `/projects` | Loyihalar |
| `/about` | Kompaniya haqida |
| `/contact` | Ariza formasi (`?service=<slug>` bilan bo‘lim oldindan tanlanadi) |

## Kontentni tahrirlash

- `src/lib/site.ts` — telefon, email, manzil, ijtimoiy tarmoqlar (**hozir namunaviy qiymatlar, haqiqiylari bilan almashtiring**).
- `src/lib/departments.ts` — 10 ta bo‘lim: har birida 6 ta xona (nima qilinadi, vazifalar, natija), rollar, nima kerak, qanday o‘lchanadi.
- `src/lib/data.ts` — xizmatlar, jarayon bosqichlari, savollar va loyihalar (**loyihalar namunaviy**).

## 3D sayohat

`src/components/journey/`

- `HomeJourney.tsx` — bosh sahifadagi sayohat, `DepartmentTour.tsx` — bo‘lim sahifasidagi sayohat.
- `JourneyStatic.tsx`, `RoomGrid.tsx` — 3D’siz versiya: kuchsiz qurilma, sekin internet, WebGL yo‘q yoki foydalanuvchi harakatni kamaytirgan bo‘lsa.
- `scene/timeline.ts` — scroll bosqichlari, `scene/exterior.ts` — kampus va ochiladigan qavat, `scene/office.ts` — ofis va xonalar, `scene/engine.ts` — hammasini boshqaradi, `scene/quality.ts` — sifatni qurilmaga moslaydi.

3D foydalanuvchi birinchi marta sichqonchani qimirlatganda, ekranga tekkanda yoki scroll qilganda yuklanadi. Ungacha xuddi shu sahnaning rasmi turadi.

| Fayl | Nima |
|---|---|
| `public/models/campus.glb` | Kampus va minora (kompyuter) |
| `public/models/campus-lite.glb` | Kampusning yengil varianti (telefon, planshet) |
| `public/models/office-hq.glb` | Ofis qavati |
| `public/media/campus-poster*`, `hero-*`, `cta*` | Kampus kadrlari |
| `public/media/open-floor-XX*` | Har bir qavatning ochiq holati (keng, telefon, kartochka) |
| `public/media/rooms-*` | Ofis rejasi va xonalar |

Rasm almashtirilsa, unga yangi nom bering: optimallashtirilgan rasmlar 30 kun keshda turadi.

## Aloqa formasi → Telegram

`.env.example` dan `.env.local` yarating va to‘ldiring:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Sozlanmagan bo‘lsa, arizalar server logiga yoziladi.
