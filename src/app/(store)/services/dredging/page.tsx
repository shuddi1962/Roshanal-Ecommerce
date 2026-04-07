import type { Metadata } from 'next'
import { DredgingServicePage } from '@/features/dredging/component'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dredging Equipment & Service | Roshanal Global',
  description: 'Professional dredging services for canals, rivers, ponds, lakes, and harbors. Cutter suction dredgers, bucket dredgers, and amphibious equipment available for hire and sale.',
}

export default function DredgingPage() {
  return <DredgingServicePage />
}
