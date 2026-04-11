import { Suspense } from 'react'

interface AuthErrorPageProps {
  searchParams: {
    error?: string
    code?: string
  }
}

function ErrorContent({ error, code }: { error?: string; code?: string }) {
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
        return 'An error occurred during authentication.'
      case 'CredentialsSignin':
        return 'Invalid email or password.'
      default:
        return 'An unexpected error occurred.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm mx-auto mb-4">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-text-1">Authentication Error</h1>
          <p className="text-text-3 mt-2">We encountered an issue with your login</p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-sm">⚠</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-1 mb-1">Error Details</p>
              <p className="text-sm text-text-3">
                {error ? getErrorMessage(error) : 'An unexpected error occurred during authentication.'}
              </p>
              {code && (
                <p className="text-xs text-text-4 mt-2">
                  Error Code: {code}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="/auth/login"
            className="w-full block text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </a>

          <a
            href="/"
            className="w-full block text-center bg-gray-100 text-text-1 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go Home
          </a>
        </div>

        {/* Demo Accounts for Testing */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-900 mb-3">Demo Accounts (for testing)</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-800">admin@roshanalglobal.com</span>
              <span className="text-blue-600">admin123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">manager@roshanalglobal.com</span>
              <span className="text-blue-600">manager123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">accountant@roshanalglobal.com</span>
              <span className="text-blue-600">accountant123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">vendor@roshanalglobal.com</span>
              <span className="text-blue-600">vendor123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">customer@test.com</span>
              <span className="text-blue-600">customer123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ErrorContent error={searchParams.error} code={searchParams.code} />
    </Suspense>
  )
}