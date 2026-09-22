import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TestAuthPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Session</h1>
          <p>Please login first</p>
          <a href="/auth/login" className="text-blue-500 underline">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Session Active</h1>
        <pre className="bg-gray-100 p-4 rounded text-left max-w-2xl">
          {JSON.stringify(session, null, 2)}
        </pre>
        <div className="mt-4">
          <p><strong>User:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Role:</strong> {session.user.role}</p>
          <p><strong>Should redirect to:</strong> {
            session.user.role === 'super_admin' ? '/admin/dashboard' :
            session.user.role === 'store_manager' ? '/admin/dashboard' :
            session.user.role === 'accountant' ? '/admin/finance' :
            session.user.role === 'vendor' ? '/vendor/dashboard' :
            '/account/dashboard'
          }</p>
        </div>
      </div>
    </div>
  )
}