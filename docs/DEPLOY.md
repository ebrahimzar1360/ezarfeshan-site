# استقرار و نگه‌داری روی سرور

سایت روی سرور مشترک آروان (`hoosh-vm-01`) اجرا می‌شود و با هر push روی `main`
خودکار منتشر می‌شود. پیکربندی واقعی سه فایل است:

| فایل | نقش |
|---|---|
| `.github/workflows/deploy.yml` | آزمون، ساخت ایمیج، انتقال به سرور، راه‌اندازی، بازگشت خودکار |
| `deploy/docker-compose.arvan.yml` | همان compose روی سرور (در `/opt/ezarfeshan/docker-compose.yml` کپی می‌شود) |
| `deploy/backup.sh` | پشتیبان پیش از انتشار روی سرور، با بررسی و آزمون بازگردانی |
| `deploy/pull-backup.sh` | همان پشتیبان از کامپیوتر خودت: اجرا روی سرور، انتقال، بررسی SHA-256، رمزگذاری |

`docker-compose.yml` و `Caddyfile` ریشهٔ مخزن برای راه‌اندازی مستقل روی سروری
دیگرند ([پایین صفحه](#راه‌اندازی-مستقل-روی-سرور-دیگر))؛ روی سرور آروان استفاده
نمی‌شوند.

---

## معماری روی سرور

سرور با محصولات دیگر مشترک است؛ این پروژه فقط به `/opt/ezarfeshan` و کانتینرهای
`ezarfeshan-*` دست می‌زند.

| بخش | جزئیات |
|---|---|
| پروژهٔ compose | `ezarfeshan` در `/opt/ezarfeshan` |
| `ezarfeshan-db` | `postgres:17-alpine`، ولوم `ezarfeshan_pgdata`، سقف حافظه ۳۸۴MB، بدون پورت بیرونی |
| `ezarfeshan-web` | ایمیج `ezarfeshan-web:latest` (در CI ساخته می‌شود)، پورت داخلی ۳۰۰۰، سقف حافظه ۶۴۰MB، لاگ ۳×۱۰MB |
| شبکه | `default` خود پروژه، و فقط وب روی `vm_default` |
| HTTPS | Caddy مشترک سرور (روی شبکهٔ `vm_default`، خارج از این مخزن) دامنه را به `ezarfeshan-web:3000` می‌فرستد |
| مهاجرت دیتابیس | هنگام استارت وب: `npx prisma migrate deploy && node server.js` |
| سلامت | `HEALTHCHECK` در `Dockerfile` (هر ۳۰ ثانیه، `/api/health`) |

```
/opt/ezarfeshan/
  docker-compose.yml   ← با هر انتشار از deploy/docker-compose.arvan.yml بازنویسی می‌شود
  .env                 ← فقط روی سرور؛ هرگز در گیت
  prisma/init/         ← اسکریپت ساخت pg_trgm برای اولین راه‌اندازی ولوم (دستی کپی شده)
  backups/             ← خروجی deploy/backup.sh (۷۰۰، فقط root)
```

`prisma/init/` با workflow منتقل نمی‌شود؛ فقط بار اولی که ولوم خالی است اجرا
می‌شود. روی ولوم موجود بی‌اثر است.

## متغیرها

### `/opt/ezarfeshan/.env` (روی سرور)

compose آن را خودکار می‌خواند.

| متغیر | اجباری | توضیح |
|---|---|---|
| `POSTGRES_PASSWORD` | بله | گذرواژهٔ دیتابیس؛ هم دیتابیس و هم `DATABASE_URL` وب از آن ساخته می‌شوند |
| `NEXT_PUBLIC_SITE_URL` | بله | نشانی کامل با `https://`؛ canonical، نقشهٔ سایت، OG و لینک ایمیل‌ها |
| `AUTH_SECRET` | بله | ۳۲ بایت تصادفی (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)؛ عوض کردنش همهٔ نشست‌ها را باطل می‌کند |
| `MAIL_DRIVER` | نه | پیش‌فرض `console` (ایمیل فقط در لاگ وب) |
| `MAIL_FROM` | نه | فرستندهٔ ایمیل‌ها |
| `OPENROUTER_API_KEY` | نه | چت‌بات؛ خالی باشد چت‌بات پیام «در دسترس نیست» می‌دهد |

> ⚠️ **ایمیل واقعی هنوز ممکن نیست.** compose آروان `SMTP_HOST`، `SMTP_PORT`،
> `SMTP_USER` و `SMTP_PASS` را به کانتینر وب نمی‌دهد؛ پس حتی با
> `MAIL_DRIVER=smtp` ایمیلی فرستاده نمی‌شود. برای فعال‌کردن، این چهار خط باید
> مثل `docker-compose.yml` ریشه به بخش `environment` وب اضافه شوند، و فرستنده
> روی دامنهٔ خود سایت باشد با SPF/DKIM/DMARC (جی‌میل نمی‌تواند فرستنده باشد).
> تا آن موقع اعلان درخواست‌ها و تأیید خبرنامه فقط در `docker logs ezarfeshan-web`
> چاپ می‌شوند.

### رازهای GitHub Actions

Settings → Secrets and variables → Actions:

| راز | مقدار |
|---|---|
| `VM_HOST` | نشانی سرور |
| `VM_USER` | کاربر SSH (`root`) |
| `VM_SSH_KEY` | کلید خصوصی deploy key |
| `VM_HOST_KEY` | خط `ssh-ed25519` سرور (`ssh-keyscan -t ed25519 <ip>`) |

## هر انتشار چه می‌کند

push روی `main` (یا اجرای دستی workflow «Deploy to Arvan»):

1. **test** — `npm ci`، `prisma generate`، `typecheck`، `npm test`. شکست = توقف.
2. **build** — ایمیج روی runner با یک Postgres موقت ساخته می‌شود (build صفحه‌های
   ایستا را از دیتابیس می‌خواند؛ دیتابیس واقعی هیچ‌وقت به CI وصل نمی‌شود).
3. **ship** — compose کپی می‌شود، ایمیج فعلی برچسب `previous` می‌گیرد و ایمیج تازه
   با `docker load` روی سرور می‌رود.
4. **restart** — `docker compose up -d`؛ وب هنگام استارت مهاجرت‌ها را اجرا می‌کند.
5. **verify** — تا ۲ دقیقه منتظر `healthy`. اگر نشد، ایمیج `previous` برمی‌گردد.

> **بازگشت خودکار فقط ایمیج را برمی‌گرداند، نه دیتابیس را.** مهاجرتی که اجرا شده
> برنمی‌گردد. برای همین هر انتشاری که migration تازه دارد، **پیش از merge** پشتیبان
> لازم دارد.

## چک‌لیست انتشار

1. آزمون‌ها روی شاخه سبز باشند (typecheck، `npm test`، build، e2e).
2. اگر `prisma/migrations/` تغییر کرده: `sh deploy/pull-backup.sh`
   ([پشتیبان‌گیری](#پشتیبان‌گیری)) — پشتیبان با آزمون بازگردانی و یک نسخهٔ رمزشده بیرون از سرور.
3. merge روی `main` و دنبال کردن اجرای «Deploy to Arvan» در Actions تا
   `deploy finished: healthy`.
4. بررسی بعد از انتشار:
   ```bash
   curl -s https://<دامنه>/api/health          # {"ok":true,"db":"up"}
   ssh root@<VM> 'docker logs --tail 50 ezarfeshan-web'
   ssh root@<VM> "docker exec ezarfeshan-db psql -U ezarfeshan -d ezarfeshan -Atc \
     'SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1'"
   ```
5. یک بار مسیر اصلی را دستی امتحان کن (مثلاً یک درخواست آزمایشی در `/services`
   و دیدنش در «درخواست‌ها»).

## پشتیبان‌گیری

### گرفتن (پیش از هر انتشار با migration)

**ساده‌ترین راه — یک دستور از کامپیوتر خودت** (Git Bash در ویندوز، یا هر ترمینال
لینوکس/مک)، از ریشهٔ مخزن:

```bash
sh deploy/pull-backup.sh
# یا با سرور و پوشهٔ مقصد دیگر:
sh deploy/pull-backup.sh root@<VM> ~/ezarfeshan-backups
```

این دستور به‌ترتیب:

1. `deploy/backup.sh` را با `--restore-test` روی سرور اجرا می‌کند (بدون کپی کردن
   اسکریپت روی سرور)
2. فایل و SHA-256 آن را با `scp` به `~/ezarfeshan-backups` می‌آورد و صحتش را
   بررسی می‌کند
3. آن را با GnuPG (AES-256) رمزگذاری می‌کند — gpg گذرواژه را می‌پرسد؛ نه در دستور
   می‌آید نه در فایل — و بررسی می‌کند نسخهٔ رمزشده به همان فایل باز شود
4. نسخهٔ رمزنشده را از کامپیوترت پاک می‌کند

و در پایان فقط نام فایل، حجم، نتیجهٔ بررسی صحت و نتیجهٔ آزمون بازگردانی را چاپ
می‌کند. `ssh`، `scp`، `sha256sum` و `gpg` هر چهار همراه Git for Windows هستند.

**اگر بخواهی قدم‌به‌قدم بروی:**

```bash
# روی سرور، با آزمون بازگردانی (tr پایان خط ویندوزی را حذف می‌کند)
tr -d '\r' < deploy/backup.sh | ssh root@<VM> 'sh -s -- --restore-test'
```

`deploy/backup.sh`:

- `pg_dump` با فرمت custom (فشرده) در `/opt/ezarfeshan/backups/ezarfeshan-<زمان UTC>.dump`
  — روی دیسک سرور، بیرون از کانتینر و ولوم؛ پوشه ۷۰۰ و فایل ۶۰۰
- **دیتابیس اصلی را فقط می‌خواند:** `pg_dump` و همهٔ پرس‌وجوهای روی آن با
  `default_transaction_read_only=on` اجرا می‌شوند
- آرشیو را دوباره می‌خواند و وجود جدول‌های اصلی را بررسی می‌کند؛ فایل ناخوانا پاک
  می‌شود و اسکریپت با خطا تمام می‌شود
- با `--restore-test` فایل را در یک دیتابیس موقت با نام تازه و زمان‌دار
  (`ezarfeshan_restore_check_<زمان>`) بازمی‌گرداند و تعداد ردیف هر جدول را با
  دیتابیس اصلی مقایسه می‌کند. اگر دیتابیسی با آن نام از قبل باشد، کاری نمی‌کند؛
  روی دیتابیسی که خودش ساخته یک توضیح (comment) نشان می‌گذارد و فقط دیتابیسی را
  پاک می‌کند که هم آن الگوی نام و هم همان نشان را داشته باشد — حتی اگر وسط کار
  خطا رخ دهد. هیچ دیتابیس دیگری، و هرگز دیتابیس اصلی، پاک نمی‌شود
- اندازه، SHA-256 و فضای خالی دیسک را چاپ می‌کند؛ هیچ داده یا گذرواژه‌ای چاپ نمی‌شود

### نسخهٔ بیرون از سرور (قدم‌به‌قدم)

```bash
mkdir -p ~/ezarfeshan-backups && cd ~/ezarfeshan-backups
scp 'root@<VM>:/opt/ezarfeshan/backups/ezarfeshan-<زمان>.dump*' .
sha256sum -c ezarfeshan-<زمان>.dump.sha256        # باید OK بگوید
gpg --symmetric --cipher-algo AES256 ezarfeshan-<زمان>.dump    # گذرواژه را می‌پرسد
gpg --decrypt ezarfeshan-<زمان>.dump.gpg | sha256sum          # باید با .sha256 یکی باشد
rm ezarfeshan-<زمان>.dump                                     # فقط بعد از یکی بودن
```

فایل شامل اطلاعات شخصی (درخواست‌ها، مشترکین) و هش گذرواژهٔ مدیرهاست: فقط نسخهٔ
`.gpg` را نگه دار، گذرواژه را در مدیر گذرواژه، و فایل را در گیت، ایمیل یا پیام‌رسان
نگذار. برای باز کردن: `gpg --output ezarfeshan-<زمان>.dump --decrypt ezarfeshan-<زمان>.dump.gpg`.

### بازگرداندن

```bash
# ۱. وب را متوقف کن تا در حین بازگردانی چیزی ننویسد
ssh root@<VM> 'cd /opt/ezarfeshan && docker compose stop ezarfeshan-web'
# ۲. دیتابیس را از فایل بازگردان (جدول‌های موجود جایگزین می‌شوند)
ssh root@<VM> 'docker exec -i ezarfeshan-db pg_restore -U ezarfeshan -d ezarfeshan \
  --clean --if-exists --no-owner --no-privileges' < ezarfeshan-<زمان>.dump
# ۳. اگر ایمیج قبلی لازم است، همان را بالا بیاور؛ وگرنه:
ssh root@<VM> 'cd /opt/ezarfeshan && docker compose up -d'
```

اگر نسخهٔ کد هم باید برگردد، `main` را به commit قبلی برگردان (revert) تا workflow
همان را منتشر کند؛ وگرنه وب تازه دوباره migration را روی دیتابیس بازگردانده اجرا می‌کند.

### خودکار

```
0 3 * * * sh /opt/ezarfeshan/backup.sh >> /opt/ezarfeshan/backups/cron.log 2>&1
```

(اسکریپت را یک بار با `scp deploy/backup.sh root@<VM>:/opt/ezarfeshan/` روی سرور
بگذار.) فایل‌های قدیمی را هم دوره‌ای پاک کن، مثلاً
`find /opt/ezarfeshan/backups -name '*.dump*' -mtime +30 -delete`.

## حساب مدیر

```bash
ssh root@<VM>
docker exec ezarfeshan-web node tools/db/create-admin.mjs \
  you@example.com "ابراهیم زرفشان" "یک-گذرواژهٔ-بلند"
```

یا بدون SSH: workflow دستی **Set admin password** در Actions (فقط هش Argon2id
می‌گیرد، نه خود گذرواژه — `tools/db/set-admin-hash.mjs`). حساب‌های بعدی از پنل،
«کاربران و دسترسی». حداقل ۱۲ کاراکتر؛ مسیر بازیابی با ایمیل وجود ندارد.

## اگر چیزی خراب شد

| نشانه | علت محتمل و کار |
|---|---|
| Actions: `new version is unhealthy - rolling back` | معمولاً migration شکست خورده؛ ایمیج قبلی برگشته. `docker logs ezarfeshan-web`. اگر migration نیمه‌کاره ثبت شده، از پشتیبان بازگردان |
| `/api/health` می‌گوید `db: down` | `ezarfeshan-db` بالا نیست یا `POSTGRES_PASSWORD` در `.env` با ولوم موجود نمی‌خواند (گذرواژهٔ ولوم فقط بار اول تنظیم می‌شود) |
| compose بالا نمی‌آید: `required` | یکی از سه متغیر اجباری در `/opt/ezarfeshan/.env` نیست |
| سایت از بیرون باز نمی‌شود ولی کانتینر سالم است | Caddy مشترک سرور یا شبکهٔ `vm_default`؛ `docker network inspect vm_default` |
| ایمیل نمی‌رسد | طبیعی است تا SMTP به compose اضافه شود ([متغیرها](#متغیرها))؛ متن در `docker logs ezarfeshan-web` است |
| جست‌وجو خطا می‌دهد | `pg_trgm` نصب نیست: `docker exec ezarfeshan-db psql -U ezarfeshan -d ezarfeshan -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"` |
| تصویر OG خطا می‌دهد | فونت `assets/fonts/` در ایمیج نیست؛ `outputFileTracingIncludes` در `next.config.ts` |
| حافظه | وب ۶۴۰MB و دیتابیس ۳۸۴MB سقف دارند؛ `docker stats ezarfeshan-web ezarfeshan-db` |

## چه چیزی در ایمیج نیست

`.dockerignore`: `docs/`، `brand-source/`، `e2e/`، `tools/audit/`، `.env`. پوشهٔ
`tools/db/` می‌ماند چون `create-admin.mjs` روی سرور لازم است.

---

## راه‌اندازی مستقل روی سرور دیگر

`docker-compose.yml` و `Caddyfile` ریشه یک پشتهٔ کامل‌اند (اپ + Postgres + Caddy
با HTTPS خودکار) برای سروری که این پروژه تنها ساکنش است. روی آروان استفاده
نمی‌شوند و نام سرویس‌هایشان (`app`، `db`) با کانتینرهای آروان فرق دارد.

```bash
cp .env.example .env     # SITE_DOMAIN، NEXT_PUBLIC_SITE_URL، POSTGRES_PASSWORD، AUTH_SECRET، MAIL_FROM
docker compose up -d --build
docker compose exec app node tools/db/create-admin.mjs you@example.com "نام" "گذرواژه"
docker compose exec -T db pg_dump -U ezarfeshan -Fc ezarfeshan > backup.dump   # پشتیبان
```

رکورد `A` دامنه باید پیش از بالا آوردن به سرور اشاره کند و پورت‌های ۸۰ و ۴۴۳ باز
باشند، وگرنه Caddy گواهی نمی‌گیرد. این compose متغیرهای SMTP را به اپ می‌دهد.

## Vercel — کنار گذاشته شد (۱۴۰۵/۰۷/۲۵)

`vercel.json` فقط برای این مانده که `git.deploymentEnabled: false` دیپلوی خودکار
ورسل را خاموش نگه دارد، تا وقتی پروژه در داشبورد ورسل حذف شود.
