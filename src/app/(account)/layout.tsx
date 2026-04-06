import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AccountSidebar from '@/components/account/AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <AccountSidebar user={session.user} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
