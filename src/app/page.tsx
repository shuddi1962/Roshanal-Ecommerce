import { redirect } from 'next/navigation'

// Root app/page.tsx — redirect to store homepage
export default function RootPage() {
  redirect('/')
}
