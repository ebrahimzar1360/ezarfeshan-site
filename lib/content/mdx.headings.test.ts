import { describe, expect, it } from 'vitest'
import { extractHeadings } from './mdx'

describe('extractHeadings', () => {
  it('collects h2 and h3 in document order', () => {
    const body = ['# عنوان مقاله', '## بخش اول', 'متن', '### زیربخش', '## بخش دوم'].join('\n')
    expect(extractHeadings(body).map((h) => [h.depth, h.text])).toEqual([
      [2, 'بخش اول'],
      [3, 'زیربخش'],
      [2, 'بخش دوم'],
    ])
  })

  it('ignores h1 and anything deeper than h3', () => {
    // h1 is the article title, rendered by the page, not the body. h4+ would
    // make the contents list a second article.
    const body = '# یک\n#### چهار\n##### پنج\n## دو'
    expect(extractHeadings(body).map((h) => h.text)).toEqual(['دو'])
  })

  it('does not read a heading out of a fenced code block', () => {
    const body = ['## واقعی', '```bash', '## این یک کامنت شل است', '```', '## دومی'].join('\n')
    expect(extractHeadings(body).map((h) => h.text)).toEqual(['واقعی', 'دومی'])
  })

  it('does not read a heading out of an HTML comment', () => {
    // prepareMdx strips these before compilation, so a commented-out section
    // must not appear in the contents either.
    const body = '## واقعی\n<!--\n## پنهان\n-->\n## دومی'
    expect(extractHeadings(body).map((h) => h.text)).toEqual(['واقعی', 'دومی'])
  })

  it('slugs Persian text without dropping it', () => {
    const [heading] = extractHeadings('## حلقه چطور کار می‌کند')
    expect(heading?.id).toBe('حلقه-چطور-کار-میکند')
  })

  it('disambiguates repeated headings within one article', () => {
    const ids = extractHeadings('## مقدمه\n## مقدمه').map((h) => h.id)
    expect(ids).toEqual(['مقدمه', 'مقدمه-1'])
  })

  it('starts the collision counter fresh for each article', () => {
    // A module-level slugger would number the second article's heading -1 purely
    // because the first article had the same one. That produces anchors which
    // work in dev and break wherever render order differs.
    const first = extractHeadings('## مقدمه')
    const second = extractHeadings('## مقدمه')
    expect(second[0]?.id).toBe(first[0]?.id)
  })

  it('tolerates closing hashes and trailing space', () => {
    expect(extractHeadings('##  بخش  ##  ').map((h) => h.text)).toEqual(['بخش'])
  })

  it('returns nothing for a body with no headings', () => {
    expect(extractHeadings('فقط یک پاراگراف.')).toEqual([])
  })
})
