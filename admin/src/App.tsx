import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard'
import PendingRequests from './pages/PendingRequests'
import ApprovedUsers from './pages/ApprovedUsers'
import Alerts from './pages/Alerts'
import UserPortal from './pages/UserPortal'

function LayoutWrapper() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress || ''
  
  // Designate admin users: if email contains "admin" or is saanvi@weatherguard.com
  const isAdmin = email.toLowerCase().includes('admin') || email === 'saanvi@weatherguard.com'

  if (!isAdmin) {
    return <UserPortal />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">⚡ WeatherGuard Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium mr-2">Admin Mode</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0 border-r border-gray-200">
          <nav className="mt-8 px-4 space-y-2">
            <SidebarLink to="/dashboard" label="📊 Dashboard" />
            <SidebarLink to="/pending-requests" label="📋 Pending Requests" />
            <SidebarLink to="/approved-users" label="✅ Approved Users" />
            <SidebarLink to="/alerts" label="🚨 Alerts" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pending-requests" element={<PendingRequests />} />
            <Route path="/approved-users" element={<ApprovedUsers />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App({ isClerkConfigured = true }: { isClerkConfigured?: boolean }) {
  const handleFallbackAuth = (mode: 'sign-in' | 'sign-up') => {
    const url = mode === 'sign-in' ? 'https://dashboard.clerk.com/sign-in' : 'https://dashboard.clerk.com/sign-up'
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Router>
      <SignedOut>
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
          <div className="max-w-2xl w-full rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">WeatherGuard Admin</p>
            <h1 className="text-4xl font-semibold">Secure, invite-only weather alerts</h1>
            <p className="mt-4 text-lg text-slate-300">
              {isClerkConfigured
                ? 'Sign in or create an account to review access requests and manage weather alerts.'
                : 'Clerk is not configured yet, so the embedded sign-in experience is unavailable. Use the buttons below to continue with Clerk setup.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {isClerkConfigured ? (
                <>
                  <SignInButton mode="modal">
                    <button className="rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg border border-cyan-400 px-5 py-3 font-medium text-cyan-300 transition hover:bg-cyan-500/10">
                      Sign up
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleFallbackAuth('sign-in')}
                    className="rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => handleFallbackAuth('sign-up')}
                    className="rounded-lg border border-cyan-400 px-5 py-3 font-medium text-cyan-300 transition hover:bg-cyan-500/10"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
            {!isClerkConfigured && (
              <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                Add your Clerk publishable key to admin/.env.local as VITE_CLERK_PUBLISHABLE_KEY to enable the in-app modal flow.
              </div>
            )}
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <LayoutWrapper />
      </SignedIn>
    </Router>
  )
}

function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition"
    >
      {label}
    </Link>
  )
}

export default App
