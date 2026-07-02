import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { featuresAPI } from '../services/api'
import { ScrollText, Search, CheckCircle, XCircle, Clock } from 'lucide-react'

const STATUS_OPTIONS = ['', 'Pending', 'Approved', 'Rejected']

const statusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'Rejected':
      return 'bg-red-500/10 text-red-600 dark:text-red-400'
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  }
}

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLeaves()
  }, [statusFilter])

  const loadLeaves = async () => {
    try {
      const res = await featuresAPI.getAdminLeaves({ status: statusFilter || undefined })
      setLeaves(res.data.leaves)
    } catch {
      toast.error('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await featuresAPI.updateLeaveStatus(id, { status: 'Approved', admin_remarks: 'Approved by admin' })
      toast.success('Leave approved')
      loadLeaves()
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    const remarks = prompt('Rejection reason (optional):')
    try {
      await featuresAPI.updateLeaveStatus(id, { status: 'Rejected', admin_remarks: remarks || '' })
      toast.success('Leave rejected')
      loadLeaves()
    } catch {
      toast.error('Failed to reject')
    }
  }

  const filtered = search
    ? leaves.filter(l =>
        l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.employee_id?.toLowerCase().includes(search.toLowerCase())
      )
    : leaves

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="loading-spinner w-12 h-12"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Review and manage employee leave requests</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Employee</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Dates</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Days</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Reason</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{l.employee_name}</p>
                      <p className="text-xs text-gray-500">{l.employee_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white capitalize">{l.leave_type}</td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">
                    {l.start_date} {l.end_date !== l.start_date ? `- ${l.end_date}` : ''}
                  </td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{l.total_days}</td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{l.reason}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {l.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(l.id)}
                          className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-500"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(l.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {l.status !== 'Pending' && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {l.updated_at ? new Date(l.updated_at).toLocaleDateString() : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
