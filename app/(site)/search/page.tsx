import type { Metadata } from 'next'
import { SearchBox } from '@/components/site/SearchBox'
import { Container } from '@/components/ui/Container'
import { SectionHead } from '@/components/ui/SectionHead'

export const metadata: Metadata = {
  title: 'جست‌وجو',
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <Container className="py-16 md:py-24">
      <SectionHead as="h1" eyebrow="جست‌وجو" title="دنبال چه می‌گردی؟" />
      <SearchBox />
    </Container>
  )
}
