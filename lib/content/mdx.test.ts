import { describe, expect, it } from 'vitest'
import { DRAFT_MARKER, hasDraftMarker, prepareMdx } from './mdx'

describe('prepareMdx', () => {
  it('strips HTML comments, which MDX cannot compile', () => {
    // MDX reads <!-- --> as JSX and fails; this broke the build once
    const body = `<!-- ${DRAFT_MARKER} -->\n\nمتن مقاله`
    expect(prepareMdx(body)).toBe('متن مقاله')
  })

  it('strips a comment spanning several lines', () => {
    expect(prepareMdx('<!--\nline one\nline two\n-->\nمتن')).toBe('متن')
  })

  it('leaves ordinary markdown untouched', () => {
    const body = '## عنوان\n\nمتن با **تأکید** و `کد`'
    expect(prepareMdx(body)).toBe(body)
  })

  it('does not mistake a less-than sign for a comment', () => {
    const body = 'اگر x < y باشد'
    expect(prepareMdx(body)).toBe(body)
  })
})

describe('hasDraftMarker', () => {
  it('finds the marker before it is stripped', () => {
    expect(hasDraftMarker(`<!-- ${DRAFT_MARKER}: بازنویسی شود -->\nمتن`)).toBe(true)
  })

  it('is false for a finished article', () => {
    expect(hasDraftMarker('## عنوان\n\nمتن')).toBe(false)
  })
})
