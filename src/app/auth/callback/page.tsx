import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ROLE_REDIRECT } from '@/lib/auth'

export default async function AuthCallbackPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const redirectPath = ROLE_REDIRECT[session.user.role] || '/account/dashboard'
  redirect(redirectPath)
}