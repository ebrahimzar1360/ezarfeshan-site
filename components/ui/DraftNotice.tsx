/**
 * Seed articles carry an HTML comment marking them as samples. Rendering that
 * marker as a visible banner is deliberate: the articles are published so the
 * site can be reviewed end to end, and a reader must never mistake one for
 * finished work. Remove the comment from the body and this disappears.
 */
export function DraftNotice() {
  return (
    <aside
      role="note"
      className="mb-10 rounded-md border border-accent/40 bg-accent/8 px-5 py-4"
    >
      <p className="text-300 font-medium text-text">این یک متن نمونه است</p>
      <p className="mt-1.5 text-300 leading-normal text-text-muted">
        برای آزمودن ساختار سایت نوشته شده و هنوز بازنویسی نشده. پیش از انتشار نهایی با
        صدا و مثال‌های ابراهیم زرفشان جایگزین می‌شود.
      </p>
    </aside>
  )
}
