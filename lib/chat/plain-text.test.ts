import { describe, expect, it } from 'vitest'
import { toPlainText } from './plain-text'

describe('toPlainText', () => {
  it('unwraps bold and italic', () => {
    expect(toPlainText('این **مهم** است')).toBe('این مهم است')
    expect(toPlainText('این *مهم* است')).toBe('این مهم است')
    expect(toPlainText('این ***مهم*** است')).toBe('این مهم است')
  })

  it('drops heading hashes but keeps the words', () => {
    expect(toPlainText('## هزینه چقدر است')).toBe('هزینه چقدر است')
  })

  it('turns list markers into bullets rather than deleting them', () => {
    // Deleting "- " would run the items together into one paragraph.
    expect(toPlainText('- اول\n- دوم')).toBe('• اول\n• دوم')
    expect(toPlainText('* اول\n+ دوم')).toBe('• اول\n• دوم')
  })

  it('keeps both the label and the URL of a link', () => {
    expect(toPlainText('[صفحهٔ مشاوره](/consult) را ببین')).toBe(
      'صفحهٔ مشاوره (/consult) را ببین'
    )
  })

  it('unwraps code spans and fences', () => {
    expect(toPlainText('مقدار `npm run dev` را بزن')).toBe('مقدار npm run dev را بزن')
    expect(toPlainText('```js\nconst a = 1\n```')).toBe('const a = 1')
  })

  it('leaves plain Persian prose untouched', () => {
    const prose = 'در صفحهٔ /consult نوشته شده که اولین گفت‌وگو هزینه‌ای ندارد.'
    expect(toPlainText(prose)).toBe(prose)
  })

  it('does not eat underscores inside identifiers', () => {
    expect(toPlainText('ستون published_at را ببین')).toBe('ستون published_at را ببین')
  })

  it('does not mangle a bare asterisk or hyphen mid-sentence', () => {
    expect(toPlainText('۵۰ تا ۱۵۰ میلیون - یعنی بازه')).toBe('۵۰ تا ۱۵۰ میلیون - یعنی بازه')
  })

  it('strips blockquotes and horizontal rules', () => {
    expect(toPlainText('> نقل قول\n\n---\n\nمتن')).toBe('نقل قول\n\nمتن')
  })

  it('handles the real leak seen in production', () => {
    const leaked = '**خدمات:**\n- سیستم‌سازی\n- هوش مصنوعی'
    expect(toPlainText(leaked)).toBe('خدمات:\n• سیستم‌سازی\n• هوش مصنوعی')
  })
})
