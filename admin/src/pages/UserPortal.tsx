import { useEffect, useState } from 'react'
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react'
import axios from 'axios'

interface AccessRequest {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  reasonForAccess: string
  telegramUsername: string
  rejectionReason?: string
  createdAt: string
}

interface Alert {
  _id: string
  title: string
  description: string
  severity: 'warning' | 'alert' | 'critical'
  location: string
  temperature?: number
  condition?: string
  windSpeed?: number
  sentAt: string
  createdAt: string
}

export default function UserPortal() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [telegramUsername, setTelegramUsername] = useState('')
  const [reasonForAccess, setReasonForAccess] = useState('')

  useEffect(() => {
    if (user) {
      bootstrapUser()
    }
  }, [user])

  const bootstrapUser = async () => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      // 1. Register or get profile
      const regRes = await axios.post(
        '/api/users/register',
        {
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          imageUrl: user?.imageUrl || '',
        },
        { headers }
      )
      setProfile(regRes.data)

      // 2. Fetch requests
      const reqRes = await axios.get(`/api/access-requests/user/${user?.id}`, { headers })
      setRequests(reqRes.data)

      // 3. Fetch alerts if user status is approved
      if (regRes.data.status === 'approved') {
        const alertRes = await axios.get(`/api/alerts/user/${user?.id}`, { headers })
        setAlerts(alertRes.data)
      }
    } catch (error) {
      console.error('Error bootstrapping user portal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!telegramUsername.trim() || !reasonForAccess.trim()) {
      alert('Please fill out all fields.')
      return
    }

    setSubmitting(true)
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      await axios.post(
        '/api/access-requests/request',
        {
          userId: profile?._id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          clerkId: user?.id,
          reasonForAccess,
          telegramUsername: telegramUsername.replace(/^@/, ''),
        },
        { headers }
      )

      alert('Access request submitted successfully!')
      bootstrapUser()
    } catch (error) {
      console.error('Failed to submit access request:', error)
      alert('Failed to submit access request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleNotifications = async (enable: boolean) => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      const endpoint = enable ? 'enable' : 'disable'
      
      const res = await axios.put(
        `/api/users/notifications/${endpoint}/${user?.id}`,
        {},
        { headers }
      )
      setProfile(res.data)
      alert(`Notifications ${enable ? 'enabled' : 'disabled'}!`)
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
      alert('Failed to toggle notifications settings.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Loading WeatherGuard Portal...</p>
        </div>
      </div>
    )
  }

  const status = profile?.status || 'pending'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Portal Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌤️</span>
            <span className="text-xl font-bold tracking-tight text-cyan-400">WeatherGuard Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">{user?.primaryEmailAddress?.emailAddress}</span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700 transition"
            >
              🔄 Refresh
            </button>
            <SignOutButton>
              <button className="rounded-lg bg-red-950/40 border border-red-800/60 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-900/40 transition">
                🚪 Log Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 mt-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Request Access Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">Request Access</h2>
                <p className="mt-2 text-slate-400 text-sm">
                  WeatherGuard is an invite-only service. Submit a request below to link a Telegram account for weather alerts.
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telegram Username
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500">@</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 py-3 pl-8 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                      placeholder="john_doe"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    We use your username to link your chat ID when you talk to the Telegram Bot.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reason for Access
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reasonForAccess}
                    onChange={(e) => setReasonForAccess(e.target.value)}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                    placeholder="Tell us why you need weather alerts (e.g. agricultural needs, extreme weather zones, etc.)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Active Subscription details (if approved) */}
          <div className="lg:col-span-5">
            {status === 'approved' ? (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <h2 className="text-xl font-bold text-white">Alert Subscription Active</h2>
                  </div>
                  <div className="space-y-4 text-sm">
                    <p className="text-slate-300">
                      Your account status is <span className="text-green-400 font-semibold">Approved</span>. You will receive weather alerts for your linked Telegram accounts.
                    </p>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <p className="text-slate-400 text-xs">
                        Active User: <span className="text-slate-200">@{profile?.telegramUsername}</span>
                      </p>
                      <p className="text-slate-400 text-xs">
                        Chat ID Connection: {profile?.telegramChatId 
                          ? <span className="text-green-400 font-medium">🟢 Connected ({profile.telegramChatId})</span>
                          : <span className="text-yellow-400 font-medium">🟡 Waiting for /start command</span>
                        }
                      </p>
                    </div>
                    {!profile?.telegramChatId && (
                      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 text-xs text-yellow-200">
                        <b>Telegram Setup:</b> Send <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">/start</code> to the bot on Telegram to complete the setup.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl mt-6">
                  <span className="text-xs font-semibold text-slate-400">Alerts Toggled:</span>
                  {profile?.notificationsEnabled ? (
                    <button
                      onClick={() => handleToggleNotifications(false)}
                      className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-500 transition"
                    >
                      🔔 Enabled
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleNotifications(true)}
                      className="rounded-lg bg-slate-700 px-4 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-600 transition"
                    >
                      🔕 Disabled
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl flex flex-col justify-center items-center text-center h-full min-h-[300px]">
                <span className="text-5xl mb-4">⏳</span>
                <h3 className="text-lg font-semibold text-white">Verification Status</h3>
                <p className="mt-2 text-slate-400 text-sm max-w-xs">
                  Once your request is approved, your active subscription details and controls will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* REQUEST HISTORY SECTION */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">📋 Sent Requests History</h3>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No access requests submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Telegram Username</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-900/30 transition">
                      <td className="py-4 px-4 font-medium text-white">@{req.telegramUsername}</td>
                      <td className="py-4 px-4 max-w-xs truncate font-mono text-xs text-slate-400" title={req.reasonForAccess}>
                        {req.reasonForAccess}
                      </td>
                      <td className="py-4 px-4">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400 border border-green-500/20">
                            ✅ Approved
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400 border border-yellow-500/20">
                            ⏳ Pending
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
                              ❌ Rejected
                            </span>
                            {req.rejectionReason && (
                              <p className="text-xs text-red-300/85 italic font-sans">Reason: {req.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ALERT HISTORY SECTION (if approved) */}
        {status === 'approved' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">🔔 Your Alert History</h3>

            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No weather alerts received yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert._id} className="border-l-4 border-cyan-500 bg-slate-900/60 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{alert.title}</h4>
                        <p className="text-slate-300 text-sm mt-1">{alert.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        alert.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                        alert.severity === 'alert' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                        'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                      {alert.location && <span>📍 {alert.location}</span>}
                      {alert.temperature !== undefined && <span>🌡️ {alert.temperature}°C</span>}
                      {alert.condition && <span>☁️ {alert.condition}</span>}
                      <span>📅 {new Date(alert.sentAt || alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
