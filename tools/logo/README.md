# ساخت لوگو

```
npm run logo
```

منبع: شیت لوگوی v4 (`brand-source/logo-sheet-v4.webp`، ۱۴۰۵/۰۷/۲۸).

- `crop-sheet.mjs` — نشان رستری را از شیت می‌بُرد: `ez-monogram.webp`،
  نسخهٔ روشن برای زمینهٔ تیره (`ez-monogram-light.webp`) و کاشی اپ (`ez-tile.webp`).
  لوگوی هدر و فوتر همین رستر است، تا دقیقاً همان شیت باشد.
- `build-logo.mjs` — فایل‌های SVG (`logo-mark`، فاویکون‌ها، آیکون maskable) را از
  خطوط برداری دست‌کشیدهٔ نشان در `components/site/home/monogram-shapes.ts` می‌سازد؛
  همان خطوطی که هیروی سه‌بعدی اکسترود می‌کند.

**هرگز رنگ یا مسیر را دستی داخل SVGها عوض نکن.** خطوط را در
`monogram-shapes.ts` و رنگ‌ها را در `build-logo.mjs` (همان پالت `globals.css`)
تغییر بده و دوباره بساز.
