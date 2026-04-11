import type { Metadata } from 'next'
import { MaintenanceServicePage } from '@/features/maintenance/component'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Maintenance Services | Roshanal Global',
  description: 'Professional maintenance services for CCTV, fire alarms, access control, solar panels, generators, and more. Preventive, comprehensive, and emergency maintenance plans available.',
}

export default function MaintenancePage() {
  return <MaintenanceServicePage />
}
