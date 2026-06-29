import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  telegramUsername: string
  approvedAt: string
  notificationsEnabled: boolean
}

export default function ApprovedUsers() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedUsers()
  }, [getToken])

  const fetchApprovedUsers = async () => {
    try {
      const token = await getToken()
      const response = await axios.get('/api/users/approved', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch approved users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Approved Users</h2>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <p className="text-gray-600">No approved users yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telegram</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Approved On</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    @{user.telegramUsername}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.approvedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.notificationsEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⊘ Disabled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
