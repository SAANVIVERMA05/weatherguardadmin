import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard'
import PendingRequests from './pages/PendingRequests'
import ApprovedUsers from './pages/ApprovedUsers'
import Alerts from './pages/Alerts'

function App() {
  return (
    <Router>
      <SignedOut>
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
          <div className="max-w-2xl w-full rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">WeatherGuard Admin</p>
            <h1 className="text-4xl font-semibold">Secure, invite-only weather alerts</h1>
            <p className="mt-4 text-lg text-slate-300">
              Sign in or create an account to review access requests and manage weather alerts.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
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
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div>
                  <h1 className="text-2xl font-bold text-primary-600">⚡ WeatherGuard Admin</h1>
                </div>
                <div className="flex items-center gap-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </nav>

          <div className="flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
              <nav className="mt-8 px-4 space-y-2">
                <NavLink to="/dashboard" label="📊 Dashboard" />
                <NavLink to="/pending-requests" label="📋 Pending Requests" />
                <NavLink to="/approved-users" label="✅ Approved Users" />
                <NavLink to="/alerts" label="🚨 Alerts" />
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pending-requests" element={<PendingRequests />} />
                <Route path="/approved-users" element={<ApprovedUsers />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </SignedIn>
    </Router>
  )
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <a
      href={to}
      className="block px-4 py-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition"
    >
      {label}
    </a>
  )
}

export default App
