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

- `HomeJourney.tsx` — bosh sahifadagi sayohatning birinchi ekrani, `HomePanels.tsx` — undan keyingi panellar (foydalanuvchi harakat qilganda qo‘shiladi), `DepartmentTour.tsx` — bo‘lim sahifasidagi sayohat.
- `parts.tsx` — birinchi ekran qismlari, `panels.tsx` va `rooms.tsx` — keyin yuklanadigan panellar, `layout.ts` — model uchun bo‘sh joy (telefonda panellar o‘lchanadi).
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

| `public/hdri/view-wide.webp`, `view-tall.webp` | Osmonning kamera ko‘radigan qismi (8K dan qirqilgan), `landscape-1k.webp` — qolgan qismi |
| `public/hdri/env-*.webp` | Shisha va metalldagi aks: three.js PMREM natijasi, oldindan tayyorlangan (`loadReflections`, `scene/util.ts`) |

Osmon rasmi almashtirilsa: `node scripts/panorama.mjs`, so‘ng `env-landscape.webp` ni yangi rasmdan PMREMGenerator bilan qayta tayyorlang.

Rasm almashtirilsa, unga yangi nom bering: optimallashtirilgan rasmlar 30 kun keshda turadi.

## Qurilmalarga moslashuv

Sayohat panellari ekran o‘lchamiga o‘zi moslashadi (`src/app/globals.css` boshidagi variantlar): `desk` / `roomy` — panel model yonida, `stack` — panel model ustida va ostida, `squat` — past noutbuk ekrani, `snug` / `low` / `tiny` — tik ushlangan telefon (brauzer panellari orasidagi balandlik bo‘yicha), `short` / `flat` — yotiq ushlangan telefon.

Bo‘limlar orasidagi joy hamma sahifada bir xil: telefonda `py-14`, planshetda `md:py-20`, kompyuterda `lg:py-28`; sarlavhadan keyingi blok `mt-8 md:mt-12`. Yangi bo‘lim qo‘shilganda ham shu qiymatlarni ishlating, telefonda katta bo‘sh joy qolmaydi.

Sichqoncha yoki trackpad bilan sahifa o‘ng tomonida sayt ranglaridagi ingichka scroll turadi (`globals.css`, "Scrollbars"); telefon va planshetda u yashirin.

## Tezlik

- CSS sahifa ichida keladi (`experimental.inlineCss`): birinchi chizish ikkinchi so‘rovni kutmaydi.
- `src/lib/polyfills.js` — Next’ning eski brauzerlar uchun zaxira kodlari o‘rniga (`turbopack.resolveAlias`).
- `scripts/trim-react-dom.cjs` — React DOM’ning bu saytda ishlatilmaydigan qismlari build paytida olib tashlanadi. Faqat fayl aynan tekshirilgan nusxa bo‘lsa ishlaydi: Next yangilansa, qadam hech narsa qilmaydi va buildda eslatma chiqadi. Skript o‘zgartirilsa, `next.config.ts` dagi `edition` raqamini oshiring.
- Formalar va bo‘lim sayohati alohida fayllarda (`Lazy*.tsx`), shuning uchun boshqa sahifaga havola ularni yuklamaydi.
- 3D sahna kichik bo‘laklarda tayyorlanadi: avval teksturalar, keyin shaderlar, keyin har bir qism bitta pikselga chiziladi (`prepare`, `warmSteps`). Telefonda tinch turgan kampus yarim kadrda chiziladi.

## Aloqa formasi → Telegram

`.env.example` dan `.env.local` yarating va to‘ldiring:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Sozlanmagan bo‘lsa, arizalar server logiga yoziladi.
