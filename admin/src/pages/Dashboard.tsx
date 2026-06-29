import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

interface Stats {
  totalUsers: number
  pendingRequests: number
  approvedUsers: number
  pendingAlerts: number
}

export default function Dashboard() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingRequests: 0,
    approvedUsers: 0,
    pendingAlerts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [usersRes, pendingRes, approvedRes, alertsRes] = await Promise.all([
          axios.get('/api/users', { headers }),
          axios.get('/api/access-requests/pending', { headers }),
          axios.get('/api/users/approved', { headers }),
          axios.get('/api/alerts/pending', { headers }),
        ])

        setStats({
          totalUsers: usersRes.data.length,
          pendingRequests: pendingRes.data.length,
          approvedUsers: approvedRes.data.length,
          pendingAlerts: alertsRes.data.length,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [getToken])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon="📋"
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <StatCard
          title="Approved Users"
          value={stats.approvedUsers}
          icon="✅"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="Pending Alerts"
          value={stats.pendingAlerts}
          icon="🚨"
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            📋 Review Pending Requests
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            🚨 Send Test Alert
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            📊 View Reports
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            ⚙️ System Settings
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
}: {
  title: string
  value: number
  icon: string
  bgColor: string
  textColor: string
}) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
