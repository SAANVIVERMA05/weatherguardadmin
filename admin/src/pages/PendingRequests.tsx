import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

interface AccessRequest {
  _id: string
  userEmail: string
  telegramUsername: string
  reasonForAccess: string
  createdAt: string
  status: string
}

export default function PendingRequests() {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')

  useEffect(() => {
    fetchPendingRequests()
  }, [getToken])

  const fetchPendingRequests = async () => {
    try {
      const token = await getToken()
      const response = await axios.get('/api/access-requests/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const token = await getToken()
      await axios.put(`/api/access-requests/${requestId}/approve`, {
        approvalNotes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRequests(requests.filter(r => r._id !== requestId))
      setSelectedRequestId(null)
      setApprovalNotes('')
      alert('Request approved!')
    } catch (error) {
      console.error('Failed to approve request:', error)
      alert('Failed to approve request')
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const token = await getToken()
      await axios.put(`/api/access-requests/${requestId}/reject`, {
        rejectionReason: reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRequests(requests.filter(r => r._id !== requestId))
      alert('Request rejected')
    } catch (error) {
      console.error('Failed to reject request:', error)
      alert('Failed to reject request')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Pending Access Requests</h2>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 text-center">
          <p className="text-gray-600">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{request.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telegram Username</p>
                  <p className="font-semibold text-gray-900">@{request.telegramUsername}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="text-gray-700">{request.reasonForAccess}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested On</p>
                  <p className="text-gray-700">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedRequestId === request._id ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Add any notes for the user..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id, 'Request not approved')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedRequestId(request._id)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Review Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
