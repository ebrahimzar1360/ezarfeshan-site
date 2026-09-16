'use client'

/**
 * Last resort: this replaces the root layout, so it has to render <html> and
 * <body> itself, and it is the page that shows when the layout is what broke.
 *
 * Everything is self-contained on purpose. Next does still inject the stylesheet
 * here in practice, but the one page whose job is to work when the app does not
 * should not depend on the app's CSS pipeline having worked. So: a literal
 * palette (the same five values globals.css defines), a <style> block carrying
 * its own dark-mode rule, and no imported component.
 *
 * The literal hex is why this file is in the raw-hex exemption list in
 * tools/audit/classes.mjs — same reason as app/layout.tsx's theme-color and the
 * OG route's Satori styles: no custom property can reach here.
 *
 * Only prefers-color-scheme is honoured, not the data-theme toggle. The script
 * that reads localStorage lives in the root layout, which is exactly what is
 * gone by the time this renders.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <style>{`
          :root { --g-bg:#f5f5f0; --g-text:#1a1a1a; --g-muted:#5a5a5a; --g-border:#dcdcd6; }
          @media (prefers-color-scheme: dark) {
            :root { --g-bg:#141613; --g-text:#edede8; --g-muted:#a3a39e; --g-border:#2c2f2c; }
          }
          html, body { margin:0; background:var(--g-bg); color:var(--g-text);
            font-family:'Vazirmatn','Segoe UI',system-ui,sans-serif; }
          .g-wrap { min-height:100dvh; display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:20px; padding:24px; text-align:center; }
          .g-mark { width:4px; height:44px; background:#c8a84b; border-radius:2px; }
          .g-h { margin:0; font-size:1.953rem; line-height:1.35; font-weight:700; }
          .g-p { margin:0; max-width:38rem; font-size:1.125rem; line-height:1.9; color:var(--g-muted); }
          .g-btn { appearance:none; cursor:pointer; border:1px solid var(--g-border);
            background:transparent; color:var(--g-text); border-radius:6px;
            padding:10px 20px; font:inherit; font-size:1rem; font-weight:500; }
          .g-btn:focus-visible { outline:2px solid #c8a84b; outline-offset:2px; }
          .g-code { margin:0; font-size:.8rem; color:var(--g-muted); }
        `}</style>

        <div className="g-wrap">
          <span aria-hidden className="g-mark" />
          <h1 className="g-h">سایت بالا نیامد</h1>
          <p className="g-p">
            یک خطای غیرمنتظره کل صفحه را متوقف کرد. دوباره تلاش کن؛ اگر باز هم نشد، کمی بعد سر بزن.
          </p>
          <button type="button" className="g-btn" onClick={reset}>
            دوباره تلاش کن
          </button>
          {error.digest && <p className="g-code">کد خطا: {error.digest}</p>}
        </div>
      </body>
    </html>
  )
}
