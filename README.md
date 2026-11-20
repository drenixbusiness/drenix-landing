# DRENIX — korporativ veb-sayt

Next.js 16 (App Router, Cache Components), Tailwind CSS v4, Motion, Lenis va Three.js asosidagi ko‘p sahifali sayt.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Sahifalar

| Yo‘l | Tavsif |
|---|---|
| `/` | Bosh sahifa: 3D feniks-zarrachalar hero, manifest, xizmatlar, jarayon, raqamlar, Launchpad, loyihalar, fikrlar |
| `/xizmatlar` | Barcha 10 ta xizmat |
| `/xizmatlar/[slug]` | Har bir xizmat sahifasi (statik generatsiya) |
| `/startaplar` | DRENIX Launchpad dasturi |
| `/loyihalar` | Keyslar |
| `/biz-haqimizda` | Kompaniya haqida |
| `/aloqa` | Ariza formasi (`?xizmat=<slug>` bilan oldindan tanlash) |

## Kontentni tahrirlash

- `src/lib/site.ts` — telefon, email, manzil, ijtimoiy tarmoqlar (**hozir namunaviy qiymatlar**).
- `src/lib/data.ts` — xizmatlar, jarayon, raqamlar, loyihalar va mijoz fikrlari (**loyihalar, raqamlar va fikrlar — demo, haqiqiylari bilan almashtiring**).

## Aloqa formasi → Telegram

`.env.example` dan `.env.local` yarating va to‘ldiring:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Sozlanmagan bo‘lsa, arizalar server logiga yoziladi.
