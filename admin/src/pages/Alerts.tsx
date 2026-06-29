import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

interface Alert {
  _id: string
  title: string
  description: string
  severity: 'warning' | 'alert' | 'critical'
  location: string
  temperature: number
  condition: string
  windSpeed: number
  sent: boolean
  sentAt: string
  createdAt: string
}

export default function Alerts() {
  const { getToken } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    severity: 'alert' as const,
    location: '',
  })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [getToken])

  const fetchAlerts = async () => {
    try {
      const token = await getToken()
      const response = await axios.get('/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAlerts(response.data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const response = await axios.post('/api/alerts/create', newAlert, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAlerts([response.data, ...alerts])
      setNewAlert({
        title: '',
        description: '',
        severity: 'alert',
        location: '',
      })
      setShowForm(false)
      alert('Alert created successfully!')
    } catch (error) {
      console.error('Failed to create alert:', error)
      alert('Failed to create alert')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'alert':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Weather Alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? '✕ Cancel' : '➕ Create Alert'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateAlert}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newAlert.title}
              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newAlert.description}
              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={newAlert.severity}
                onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="warning">⚠️ Warning</option>
                <option value="alert">🚨 Alert</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={newAlert.location}
                onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Create Alert
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <p className="text-gray-600">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-gray-600 mt-1">{alert.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {alert.location && (
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{alert.location}</p>
                  </div>
                )}
                {alert.temperature && (
                  <div>
                    <p className="text-gray-600">Temperature</p>
                    <p className="font-semibold text-gray-900">{alert.temperature}°C</p>
                  </div>
                )}
                {alert.windSpeed && (
                  <div>
                    <p className="text-gray-600">Wind Speed</p>
                    <p className="font-semibold text-gray-900">{alert.windSpeed} km/h</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">
                    {alert.sent ? '✅ Sent' : '⏳ Pending'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Created: {new Date(alert.createdAt).toLocaleString()}
                {alert.sentAt && ` • Sent: ${new Date(alert.sentAt).toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
