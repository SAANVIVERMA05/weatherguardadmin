import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
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

  const currentRequest = requests[0]
  const status = profile?.status || 'pending'

  // Decide user status: if no requests found, we allow submitting request
  const hasSubmittedRequest = requests.length > 0

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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 mt-12">
        {!hasSubmittedRequest ? (
          /* REQUEST ACCESS FORM */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-white">Request Access</h2>
              <p className="mt-2 text-slate-400">
                WeatherGuard is an invite-only service. Submit your request below to gain access to automated Telegram weather alerts.
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
                    className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 py-3 pl-8 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                  rows={4}
                  value={reasonForAccess}
                  onChange={(e) => setReasonForAccess(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Tell us why you need weather alerts (e.g. agricultural needs, extreme weather zones, etc.)"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </form>
          </div>
        ) : status === 'pending' || currentRequest?.status === 'pending' ? (
          /* PENDING REVIEW */
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center shadow-xl">
            <span className="text-5xl">⏳</span>
            <h2 className="mt-4 text-2xl font-bold text-yellow-400">Request Pending Review</h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              Your access request has been logged. An administrator will review your application shortly.
            </p>

            <div className="mt-8 border-t border-slate-800 pt-8 max-w-md mx-auto text-left">
              <h3 className="text-lg font-semibold text-white mb-4">🚀 Next Steps: Link Telegram</h3>
              <p className="text-sm text-slate-400 mb-4">
                To receive alerts, you must activate and link your Telegram account:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                <li>Search for the Telegram bot.</li>
                <li>Start a chat and send the <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">/start</code> command.</li>
                <li>Your chat ID will be paired automatically using your username <b>@{currentRequest?.telegramUsername}</b>.</li>
              </ol>
            </div>
          </div>
        ) : status === 'rejected' || currentRequest?.status === 'rejected' ? (
          /* REJECTED REVIEW */
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-xl">
            <span className="text-5xl">❌</span>
            <h2 className="mt-4 text-2xl font-bold text-red-400">Request Rejected</h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
              Unfortunately, your request for weather alert access was not approved.
            </p>
            {currentRequest?.rejectionReason && (
              <div className="mt-4 rounded-lg bg-red-500/10 p-4 text-red-300 text-sm max-w-md mx-auto">
                <b>Reason:</b> {currentRequest.rejectionReason}
              </div>
            )}
            <button
              onClick={() => {
                setRequests([])
              }}
              className="mt-8 rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold hover:bg-slate-700 transition"
            >
              Try Again / Re-apply
            </button>
          </div>
        ) : (
          /* APPROVED PORTAL DASHBOARD */
          <div className="space-y-8">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <h2 className="text-2xl font-bold text-white">Alert Subscription Active</h2>
                  </div>
                  <p className="mt-1 text-slate-400 text-sm">
                    Linked Telegram username: <span className="text-cyan-400">@{profile?.telegramUsername || currentRequest?.telegramUsername}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {profile?.telegramChatId 
                      ? `🟢 Chat ID Linked: ${profile.telegramChatId}`
                      : '🟡 Telegram Bot chat ID not linked. Send /start to the Telegram Bot to begin receiving alerts!'}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                  <span className="text-xs font-semibold px-2 text-slate-400">Alerts Toggled:</span>
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
            </div>

            {/* ALERT HISTORY */}
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
          </div>
        )}
      </main>
    </div>
  )
}
