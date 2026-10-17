import { compileMDX } from 'next-mdx-remote/rsc'
import { Container } from '@/components/ui/Container'
import { createMdxComponents } from '@/components/ui/mdx'
import { prepareMdx } from '@/lib/content/mdx'

/**
 * The real renderer, for unpublished text: the same compiler and component
 * allowlist the public article page uses, inside the admin (so behind auth and
 * noindex). A compile error is shown, not thrown — a half-written component
 * should tell the writer where it broke.
 */
export async function MdxPreview({ title, excerpt, body, note }: { title: string; excerpt: string; body: string; note: string }) {
  let content: React.ReactNode
  try {
    content = (await compileMDX({ source: prepareMdx(body), components: createMdxComponents() })).content
  } catch (cause) {
    content = <p role="alert">MDX کامپایل نشد: {cause instanceof Error ? cause.message : String(cause)}</p>
  }
  return (
    <div className="rounded-lg border border-border bg-bg">
      <p className="border-b border-border bg-bg-sunken px-6 py-3 text-200 text-text-muted">{note}</p>
      <Container width="measure" className="py-10">
        <h1 className="text-display-sm font-black leading-[1.25]">{title}</h1>
        <p className="mt-5 text-500 leading-normal text-text-muted">{excerpt}</p>
        <div className="prose mt-10">{content}</div>
      </Container>
    </div>
  )
}
