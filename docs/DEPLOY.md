# راه‌اندازی روی سرور

سه فایل کار را انجام می‌دهند: `Dockerfile`، `docker-compose.yml`، `Caddyfile`.
سرویس‌ها: اپ + PostgreSQL + Caddy (برای HTTPS خودکار).

> **این پیکربندی روی این ماشین اجرا نشده.** داکر نصب نیست و نصبش ۶۲۹MB روی
> اتصالی با سرعت ~۷۵KB/s است. فایل‌ها نوشته و بازبینی شده‌اند ولی اولین
> `docker compose up` روی سرور، اولین اجرای واقعی‌شان است. بخش
> [اگر چیزی خراب شد](#اگر-چیزی-خراب-شد) را کنار دستت داشته باش.

---

## پیش‌نیازها

- سروری با داکر و پلاگین compose
- دامنه‌ای که رکورد `A` آن به IP همان سرور اشاره کند — **قبل از** بالا آوردن،
  وگرنه Caddy نمی‌تواند گواهی بگیرد
- پورت‌های ۸۰ و ۴۴۳ باز

## گام یک — متغیرها

```bash
cp .env.example .env
```

`.env` را پر کن. این پنج مورد اجباری‌اند و compose بدونشان بالا نمی‌آید:

| متغیر | مقدار |
|---|---|
| `SITE_DOMAIN` | `ezarfeshan.com` — بدون `https://` |
| `NEXT_PUBLIC_SITE_URL` | `https://ezarfeshan.com` — **با** `https://` |
| `POSTGRES_PASSWORD` | یک گذرواژهٔ تصادفی بلند |
| `AUTH_SECRET` | خروجی دستور زیر |
| `MAIL_FROM` | `ابراهیم زرفشان <hello@ezarfeshan.com>` |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**`AUTH_SECRET` را هرگز در گیت commit نکن.** عوض کردنش همهٔ نشست‌های باز را
باطل می‌کند، که همان کار درست هنگام مشکوک شدن است.

## گام دو — ایمیل

بدون این، فرم خبرنامه ثبت‌نام را می‌پذیرد ولی هیچ ایمیل تأییدی نمی‌رسد.

```
MAIL_DRIVER="smtp"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="hello@ezarfeshan.com"
SMTP_PASS="..."
```

**فرستنده باید روی دامنهٔ خودت باشد، نه جی‌میل.** روی `gmail.com` نمی‌شود
SPF/DKIM تنظیم کرد و ایمیل تأیید به اسپم می‌رود. جی‌میل به‌عنوان *نشانی تماس*
روی سایت مشکلی ندارد — به‌عنوان *فرستنده* نه.

بعد از راه‌اندازی، این سه رکورد DNS را اضافه کن:

| نوع | نام | مقدار |
|---|---|---|
| TXT | `@` | `v=spf1 include:<سرویس ایمیلت> ~all` |
| TXT | `<selector>._domainkey` | کلید DKIM که سرویس می‌دهد |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@ezarfeshan.com` |

`p=none` شروع درستی است: گزارش می‌گیری بدون اینکه ایمیل‌های سالم رد شوند.
بعد از چند هفته که گزارش‌ها تمیز بود، `p=quarantine`.

## گام سه — بالا آوردن

```bash
docker compose up -d --build
```

بار اول چند دقیقه طول می‌کشد. مهاجرت‌های دیتابیس **هنگام استارت کانتینر** اجرا
می‌شوند نه هنگام ساخت ایمیج — ساخت ایمیج به دیتابیس پروداکشن دسترسی ندارد و
نباید داشته باشد.

بررسی:

```bash
curl -s https://<دامنه>/api/health     # {"ok":true,"db":"up"}
docker compose logs -f app
```

## گام چهار — حساب مدیر

```bash
docker compose exec app node tools/db/create-admin.mjs \
  you@example.com "ابراهیم زرفشان" "یک-گذرواژهٔ-بلند"
```

حداقل ۱۲ کاراکتر. **مسیر بازیابی گذرواژه با ایمیل وجود ندارد** — همین دستور با
همان ایمیل، گذرواژه را عوض می‌کند و همان مسیر بازیابی است.

> ⚠️ گذرواژه‌ای که در توسعه استفاده شد در تاریخچهٔ ترمینال مانده. **قبل از
> اولین ورود واقعی عوضش کن.**

## گام پنج — محتوای اولیه

```bash
docker compose exec app npx prisma db seed
```

شش مقالهٔ نمونه با موضوع‌هایشان اضافه می‌شود. **همه با نشان «متن نمونه»** روی
صفحه دیده می‌شوند. پیش از معرفی سایت به کسی، یا بازنویسی‌شان کن یا حذفشان کن.

---

## به‌روزرسانی

```bash
git pull
docker compose up -d --build
```

مهاجرت‌های جدید خودکار اعمال می‌شوند. اگر مهاجرت شکست بخورد کانتینر بالا
نمی‌آید — که بهتر از بالا آمدن با اسکیمای ناسازگار است.

## پشتیبان‌گیری

```bash
# گرفتن
docker compose exec -T db pg_dump -U ezarfeshan ezarfeshan | gzip > backup-$(date +%F).sql.gz

# بازگرداندن
gunzip -c backup-1405-05-30.sql.gz | docker compose exec -T db psql -U ezarfeshan ezarfeshan
```

خودکارش کن. یک خط در crontab:

```
0 3 * * * cd /srv/ezarfeshan && docker compose exec -T db pg_dump -U ezarfeshan ezarfeshan | gzip > /backups/ez-$(date +\%F).sql.gz
```

پشتیبانی که بازگرداندنش را امتحان نکرده‌ای، پشتیبان نیست. **یک بار روی یک
دیتابیس آزمایشی امتحانش کن.**

## اگر چیزی خراب شد

| نشانه | علت محتمل |
|---|---|
| `ECONNREFUSED` هنگام `admin:create` | دیتابیس خاموش است. محلی: `npm run db start`. روی سرور: کانتینر `db` بالا نیست |
| Caddy گواهی نمی‌گیرد | رکورد `A` هنوز به این سرور اشاره نمی‌کند، یا پورت ۸۰ بسته است. Caddy برای اعتبارسنجی به ۸۰ نیاز دارد حتی برای HTTPS |
| اپ بالا می‌آید و بعد می‌افتد | مهاجرت شکست خورده. `docker compose logs app` |
| `/api/health` می‌گوید `db: down` | `POSTGRES_PASSWORD` بین `db` و `app` یکی نیست |
| ثبت‌نام کار می‌کند ولی ایمیل نمی‌رسد | `MAIL_DRIVER` هنوز `console` است — در لاگ اپ چاپ می‌شود |
| جست‌وجو خطا می‌دهد | افزونهٔ `pg_trgm` نصب نشده. اگر ولوم دیتابیس از قبل وجود داشته، `prisma/init/` اجرا نشده: `docker compose exec db psql -U ezarfeshan -d ezarfeshan -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"` |
| تصویر OG خالی یا خطا | فونت در `assets/fonts/` جا نیفتاده. `outputFileTracingIncludes` در `next.config.ts` باید آن را کپی کند |
| مقالهٔ تازه ۴۰۴ می‌دهد | نباید بدهد — `dynamicParams` روشن است و فیلتر انتشار در هر کوئری زمان را دوباره می‌خواند. اگر دیدی، باگ است |

## Vercel

بدون تغییر کد کار می‌کند. فقط:

- `DATABASE_URL` را به یک PostgreSQL مدیریت‌شده وصل کن (روی Vercel دیتابیسی
  اجرا نمی‌شود)
- بقیهٔ متغیرها را در تنظیمات پروژه بگذار
- **افزونهٔ `pg_trgm` را دستی روی آن دیتابیس بساز**، وگرنه جست‌وجو کار نمی‌کند
- `output: 'standalone'` روی Vercel نادیده گرفته می‌شود و مشکلی ایجاد نمی‌کند

## چه چیزی روی سرور نیست و نباید باشد

`brand-source/` (فایل‌های خام برند)، `docs/`، `e2e/`، `tools/audit/` — همه در
`.dockerignore` هستند. `tools/db/` و `tools/logo/` می‌مانند چون
`create-admin.mjs` روی سرور لازم است.
