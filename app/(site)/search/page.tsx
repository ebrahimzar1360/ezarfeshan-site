import type { Metadata } from 'next'
import { SearchBox } from '@/components/site/SearchBox'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'جست‌وجو',
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <>
      <PageHeader eyebrow="جست‌وجو" title="دنبال چه می‌گردی؟" lead="در عنوان و متن همهٔ نوشته‌ها — حتی با بخشی از یک کلمه." />
      <Container className="py-14 md:py-20">
        <div className="max-w-3xl">
          <SearchBox />
        </div>
      </Container>
    </>
  )
}
