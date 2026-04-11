"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Redirect to callback page which will handle role-based redirect
        router.push('/auth/callback');
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue to-blue-700 flex items-center justify-center shadow-sm mx-auto mb-4">
            <span className="text-white font-bold text-xl tracking-tight">RS</span>
          </div>
          <h1 className="text-2xl font-bold text-text-1">Welcome Back</h1>
          <p className="text-text-3 mt-2">Sign in to your Roshanal Global account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-1 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue text-sm"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-1 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue text-sm"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-3">
              Don't have an account?{" "}
              <a href="/auth/register" className="text-blue hover:underline font-medium">
                Create one here
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-text-1 mb-4">Demo Accounts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-3">Super Admin:</span>
              <span className="font-mono text-text-1">admin@roshanalglobal.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-3">Store Manager:</span>
              <span className="font-mono text-text-1">manager@roshanalglobal.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-3">Accountant:</span>
              <span className="font-mono text-text-1">accountant@roshanalglobal.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-3">Vendor:</span>
              <span className="font-mono text-text-1">vendor@roshanalglobal.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-3">Customer:</span>
              <span className="font-mono text-text-1">customer@roshanalglobal.com</span>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-text-3 text-center">Password: <span className="font-mono text-text-1">Roshanal2026!</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
