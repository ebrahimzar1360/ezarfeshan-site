# وب‌سایت برند ابراهیم زرفشان

پلتفرم برند شخصی و اقتدار محتوایی. Next.js 15 · TypeScript strict · Tailwind v4 · RTL بومی.

## راه‌اندازی محلی

```bash
npm install
npm run db init      # پستگرس محلی — فقط بار اول
npm run db:migrate
npm run db:seed
npm run dev          # http://localhost:3000
```

اتصال به رجیستری npm در این محیط کند است (~۷۵KB/s). `.npmrc` مهلت‌ها را باز
کرده تا نصب نیمه‌کاره قطع نشود — نصب اول ممکن است چند دقیقه طول بکشد.

## دستورها

| دستور | کار |
|---|---|
| `npm run dev` | سرور توسعه |
| `npm run build` | بیلد پروداکشن |
| `npm start` | سرو بیلد |
| `npm run typecheck` | بررسی تایپ بدون بیلد |
| `npm run fonts` | دانلود مجدد فونت‌ها و تولید `app/fonts.css` |
| `npm run logo` | ساخت SVGهای لوگو و نشان inline هدر |
| `npm run photos` | کراپ و تصحیح رنگ پرتره‌ها |
| `npm run db init` | ساخت کلاستر پستگرس محلی (یک‌بار) |
| `npm run db start` / `stop` | روشن و خاموش کردن دیتابیس |
| `npm run db:migrate` | اعمال مهاجرت Prisma |
| `npm run db:seed` | پر کردن موضوع‌ها و شش مقالهٔ نمونه |
| `npm run db:studio` | مرورگر دیتابیس Prisma |
| `npm run admin:create` | ساخت یا تغییر گذرواژهٔ حساب مدیر |
| `npm test` | تست‌های واحد (Vitest) |
| `npm run test:e2e` | تست‌های مرورگر (Playwright) |

## متغیرهای محیطی

از `.env.example` کپی بگیر:

```bash
cp .env.example .env.local
```

| متغیر | کار | وضعیت |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ریشهٔ دامنه — متادیتا، canonical، sitemap | ❓ دامنه هنوز مشخص نیست |
| `DATABASE_URL` | اتصال پستگرس | ✅ با `npm run db init` ساخته می‌شود |
| `MAIL_DRIVER` | `console` (توسعه) یا `smtp` | ✅ پیش‌فرض `console` |
| `SMTP_*` | تنظیمات ارسال واقعی | ❓ نیازمند دامنه |
| `AUTH_SECRET` | کلید امضای نشست ادمین | ✅ در پروداکشن عوضش کن |

## ساختار

```
app/(site)/          صفحات عمومی — هدر و فوتر اینجاست
app/admin/(protected)/ پنل مدیریت — احراز هویت در لایوت این گروه
app/admin/login/     صفحهٔ ورود — عمداً بیرون از گروه محافظت‌شده
app/api/             روت‌هندلرها
  globals.css        توکن‌های طراحی — تنها منبع رنگ، تایپ و فاصله
  fonts.css          تولیدشده توسط npm run fonts — دستی ویرایش نکن
components/ui/       کامپوننت‌های پایه (Button، Container، Section، Logo…)
components/site/     بلوک‌های سایت (Header، Footer، ThemeToggle)
lib/site.ts          هویت و اطلاعات تماس — تنها منبع حقیقت
lib/db.ts            کلاینت Prisma (driver adapter)
lib/content/         کوئری‌های محتوا، زندگی‌نامه، آماده‌سازی MDX
prisma/              اسکیما، مهاجرت‌ها، seed و متن مقالات نمونه
public/brand/        لوگو و آیکون‌ها (تولیدشده)
public/photos/       پرتره‌های تصحیح‌رنگ‌شده (تولیدشده)
public/fonts/        فونت‌های self-hosted
tools/logo/          ساخت لوگو از خطوط فونت
tools/photos/        کراپ و تصحیح رنگ عکس‌ها
tools/fonts/         دریافت و ساب‌ست فونت
tools/audit/         سنجش سرریز چیدمان و اسکرین‌شات (CDP)
brand-source/        فایل‌های خام — ورودی، نه خروجی
docs/                DESIGN-PLAN.md · OPEN-QUESTIONS.md
```

## قواعدی که کد به آن‌ها پایبند است

- **هیچ رنگ یا اندازهٔ هاردکد در کامپوننت‌ها.** همه از توکن‌های `app/globals.css`.
- **هیچ `left`/`right` در CSS.** فقط خصوصیات منطقی — سایت بومی RTL است.
- **طلایی هرگز متن روی زمینهٔ روشن نیست** (کنتراست ۲.۱:۱). فقط سطح و نشانه.
- **کلاس تیلویند رشتهٔ ساخته‌شده نباشد.** `bg-${x}` هیچ CSSای تولید نمی‌کند.
- **مسیر SVG دستی کپی نشود.** `npm run logo` تولیدش می‌کند؛ کپی دستی یک بار
  باعث شد حروف با یک‌دهم اندازه رندر شوند.
- **سکشن تیره از `tone-inverse` استفاده کند**، نه رنگ دستی — وگرنه متن کم‌رنگ
  روی سبز تیره ناخوانا می‌شود.

## بررسی چیدمان

```bash
npm start
node tools/audit/measure.js http://localhost:3000/ 360 390 768 1440 1920
node tools/audit/shot.js    http://localhost:3000/ ./shots 390 1440
THEME=dark node tools/audit/shot.js http://localhost:3000/ ./shots 1440
```

`rail.js` نوار پیشرفت طلایی را با اسکرول واقعی می‌سنجد — یک اسکرین‌شات ثابت
نمی‌تواند نشان دهد که انیمیشن اسکرول‌محور کار می‌کند یا در حالت پایانی گیر کرده.

`seo.mjs` سایت‌مپ، robots، RSS، JSON-LD، تصویر OG، آنالیتیکس و جست‌وجو را
می‌سنجد:

```bash
node tools/audit/seo.mjs http://localhost:3000
```

`admin.mjs` ثابت می‌کند پنل مدیریت واقعاً بسته است — فرم ورودِ ظاهراً سالم
هیچ چیزی را ثابت نمی‌کند:

```bash
node tools/audit/admin.mjs http://localhost:3000 <email> <password>
```

`flow.mjs` فلوی کامل خبرنامه (ثبت‌نام، تأیید، لغو عضویت) و فرم مشاوره را روی
سرور و دیتابیس واقعی تست می‌کند:

```bash
npm start > server.log 2>&1 &
node tools/audit/flow.mjs http://localhost:3000 server.log
```

`measure.js` با کد خروجی غیرصفر برمی‌گردد اگر صفحه سرریز افقی داشته باشد و
دقیقاً می‌گوید کدام المان مقصر است.

> هر دو ابزار از `--headless=new` استفاده می‌کنند. حالت قدیمی
> `--headless --screenshot --window-size` صفحات RTL را غلط رندر می‌کند و
> تصویری بریده و جابه‌جا می‌دهد حتی وقتی چیدمان سالم است.

## وضعیت

همهٔ هشت فاز تمام شده. برای دیپلوی: [docs/DEPLOY.md](docs/DEPLOY.md).
فازهای بعدی و موارد باز در [docs/OPEN-QUESTIONS.md](docs/OPEN-QUESTIONS.md).
