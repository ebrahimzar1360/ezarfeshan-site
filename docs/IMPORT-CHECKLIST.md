# چک‌لیست واردکردن کامپوننت

> هر فایلی که از یک رجیستری shadcn (از جمله ۲۱st.dev) وارد می‌شود، پیش از خروج از
> `components/ui/vendor/` این ۲۴ گام را می‌گذراند.
> دلیل وجود این سند به‌جای یک لایهٔ alias توکن، در `UX-OVERHAUL.md` §۳ فاز ۰.۳ است.

---

## قاعدهٔ سرانگشتی — اول این را بخوان

اگر گام‌های **۶، ۷، ۲۰ و ۲۱** هر چهار روی یک کامپوننت صدق کردند، **پورتش نکن —
بنویسش.** این دربارهٔ هر carousel، marquee، dock، و تب با اندیکاتور متحرک در
۲۱st.dev صادق است. پورت‌کردنشان از نوشتنشان بیشتر طول می‌کشد و نتیجه‌اش بدتر است.

---

## ۱. جهت — RTL

سایت `dir="rtl"` است و `CLAUDE.md` هیچ `left`/`right` را نمی‌پذیرد.

| # | پیدا کن | بگذار |
|---|---|---|
| ۱ | `left-*` `right-*` | `start-*` `end-*` |
| ۲ | `ml-* mr-* pl-* pr-*` | `ms-* me-* ps-* pe-*` |
| ۳ | `text-left` `text-right` | `text-start` `text-end` |
| ۴ | `border-l-* border-r-*` | `border-s-* border-e-*` |
| ۵ | `rounded-l-* rounded-r-*` | `rounded-s-* rounded-e-*` |
| ۶ | `origin-left` / `origin-right` | معادل منطقی **ندارد**. ترنسفورم را بازنویس، یا انیمیشن را حذف کن |
| ۷ | `translate-x-*` داخل کی‌فریم | بازنویسی یا حذف |

> **گام ۷ سخت‌ترین است و بی‌صدا خراب می‌کند.** یک `@keyframes` با
> `translateX(-100%)` با `dir="rtl"` **آینه نمی‌شود** — پنل از سمت اشتباه سُر
> می‌خورد و هیچ خطایی نمی‌دهد. در این پروژه، الگوی جایگزین همان `.enter` موجود
> است: `opacity` به‌علاوهٔ یک `translate: 0 -8px` عمودی، که جهت‌خنثی است.
>
> یادآوری جدا: تقسیم متن به `<span>` تک‌حرفی (کل دستهٔ *text animations*)
> **اتصال حروف فارسی را از بین می‌برد** — «سیستم» می‌شود «س ی س ت م». این یک باگ
> درستی است، نه سلیقه. آن دسته کلاً وارد نمی‌شود.

## ۲. توکن‌ها

قرارداد shadcn با نقش‌های این پروژه یکی نیست. مهم‌ترین تصادم: در shadcn
`accent` یعنی «سطح hover خاکستری ملایم»، اینجا **`--accent` طلایی است**.

| # | پیدا کن | بگذار |
|---|---|---|
| ۸ | `bg-background` `text-foreground` | `bg-bg` `text-text` |
| ۹ | `text-muted-foreground` | `text-text-muted` یا `text-text-subtle` — **بر اساس کنتراست انتخاب کن، نه شباهت اسم** |
| ۱۰ | `bg-card` `bg-popover` | `bg-bg-raised` |
| ۱۱ | `border-input` | `border-border` یا `border-border-strong` |
| ۱۲ | `ring-*` `ring-offset-*` | حذف — قانون سراسری `:focus-visible` در `globals.css` از قبل کار را می‌کند |
| ۱۳ | `bg-primary text-primary-foreground` | `bg-solid-bg text-solid-text` |
| ۱۴ | `bg-destructive` `text-destructive` | **رنگ مخرب نداریم.** پالت پنج رنگ است و قرمز در آن نیست. با `border-accent` و متن صریح تفکیک کن |
| ۱۵ | `bg-accent` `text-accent` وارداتی | **با دقت بخوان** — در کد ما طلایی است. اگر منظور کامپوننت «سطح hover» بوده، `hover:bg-bg-sunken` بگذار |

## ۳. زبان بصری

| # | پیدا کن | بگذار | مرجع |
|---|---|---|---|
| ۱۶ | `rounded-full` `rounded-2xl` `rounded-3xl` | `rounded-md` / `rounded-lg` | §۴ سند طراحی؛ تنها استثنا لانچر چت |
| ۱۷ | `text-xs/sm/base/lg/xl/2xl/3xl…` | `text-200…text-1000` | اندازه‌های استوک تیلویند **کار می‌کنند** — همین رانش بی‌صدا را باید گرفت |
| ۱۸ | `shadow-sm/md/lg/xl/2xl` | `shadow-(--shadow)` یا هیچ | کارت‌ها با خط مویی از زمینه جدا می‌شوند، نه با سایه. سایه فقط `Dialog` و `Toast` |
| ۱۹ | هر گرادیانت، `backdrop-blur` تزئینی، بافت | حذف | §۱۰ ضدالگوها |
| ۲۰ | هگز خام یا `zinc/slate/gray/neutral/red/blue` | توکن | پنج رنگ برند و مشتقات `color-mix` آن‌ها |

> **`dark:` را دست نزن.** `@custom-variant dark` در `globals.css` آن را به منطق
> سه‌حالتهٔ `data-theme` بازتعریف کرده، پس واریانت وارداتی درست کار می‌کند.
> این یکی از معدود بردهای رایگان است.

## ۴. وابستگی و رفتار

| # | پیدا کن | بگذار |
|---|---|---|
| ۲۱ | `@radix-ui/*` | `<dialog>` بومی یا معادل دست‌ساز — §۴ بودجه |
| ۲۲ | `motion` / `framer-motion` | ترنزیشن CSS، یا حذف |
| ۲۳ | `lucide-react` | آیکون محلی از `components/ui/Icon.tsx` |
| ۲۴ | `transition-all` | `transition-[background-color,border-color,color]` — قرارداد `Button.tsx` |

## ۵. دو چیزی که همیشه فراموش می‌شود

- **هر رشتهٔ انگلیسی رابط فارسی می‌شود.** «صفر رشتهٔ انگلیسی در رابط» سنجهٔ پذیرش
  §۱۱ سند طراحی است.
- **هر انیمیشن باید زیر `prefers-reduced-motion` واقعاً حذف شود.** قانون سراسری
  `globals.css` مدت `animation` و `transition` را صفر می‌کند، ولی حرکتی که با
  جاوااسکریپت اجرا می‌شود (مثل `scrollIntoView({ behavior: 'smooth' })` یا یک
  `requestAnimationFrame`) را نمی‌گیرد. آن‌ها را دستی پشت
  `matchMedia('(prefers-reduced-motion: reduce)')` بگذار.

---

## ۶. بعد از پورت

```bash
npm run lint:brand      # حفاظ گرپ‌محور — گام‌های ۱ تا ۵ و ۱۶ تا ۲۰ را می‌گیرد
npm run typecheck
node tools/audit/measure.js http://localhost:3210/<route-that-uses-it> 360 390 768 1440 1920
THEME=dark node tools/audit/shot.js http://localhost:3210/<route> ./shots 390 1440
```

`lint:brand` همهٔ گام‌ها را نمی‌گیرد — گام‌های ۶، ۷، ۹، ۱۴، ۱۵ و ۲۲ قضاوت
می‌خواهند. آن‌ها را چشمی بررسی کن، در هر دو تم، و داخل یک سکشن `.tone-inverse`.
