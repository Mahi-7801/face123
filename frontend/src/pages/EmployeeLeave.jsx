import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { featuresAPI } from '../services/api'
import { CalendarDays, Plus, List, Activity, Heart, Briefcase, Clock } from 'lucide-react'
import { toast } from 'react-toastify'

const LEAVE_TYPES = ['Sick', 'Casual', 'Earned', 'Other']

const typeIcons = {
  Sick: Activity,
  Casual: Heart,
  Earned: Briefcase,
  Other: Clock,
}

const typeColors = {
  Sick: 'text-red-600 dark:text-red-400 bg-red-500/10',
  Casual: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  Earned: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  Other: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
}

const statusStyles = {
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  cancelled: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
}

export default function EmployeeLeave() {
  const [form, setForm] = useState({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' })
  const [leaves, setLeaves] = useState([])
  const [balance, setBalance] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      featuresAPI.getMyLeaves(),
      featuresAPI.getLeaveBalance(),
    ])
      .then(([leavesRes, balanceRes]) => {
        setLeaves(leavesRes.data.leaves || [])
        setBalance(balanceRes.data.balance || {})
      })
      .catch(() => toast.error('Failed to load leave data'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.start_date || !form.end_date) {
      toast.error('Please select start and end dates')
      return
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error('End date must be after start date')
      return
    }
    setSubmitting(true)
    try {
      await featuresAPI.applyLeave(form)
      toast.success('Leave applied successfully')
      setForm({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' })
      const [leavesRes, balanceRes] = await Promise.all([
        featuresAPI.getMyLeaves(),
        featuresAPI.getLeaveBalance(),
      ])
      setLeaves(leavesRes.data.leaves || [])
      setBalance(balanceRes.data.balance || {})
    } catch {
      toast.error('Failed to apply leave')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Apply for leave and track your requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Apply Leave</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Leave Type
                </label>
                <select
                  name="leave_type"
                  value={form.leave_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>{type} Leave</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    min={today}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    min={form.start_date || today}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter reason for leave..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
              >
                {submitting ? 'Applying...' : 'Apply Leave'}
              </button>
            </form>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <List className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leave History</h2>
            </div>
            {leaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Start</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">End</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Days</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Reason</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave, i) => {
                      const Icon = typeIcons[leave.leave_type] || Clock
                      const days = Math.ceil(
                        (new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)
                      ) + 1
                      return (
                        <tr key={leave.id || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[leave.leave_type] || typeColors.Other}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-gray-900 dark:text-white capitalize">{leave.leave_type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{leave.start_date}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{leave.end_date}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{days}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{leave.reason || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[leave.status?.toLowerCase()] || statusStyles.pending}`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <List className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No leave requests found</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leave Balance</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: 'sick_leave', label: 'Sick Leave', icon: Activity, color: 'red' },
                { key: 'casual_leave', label: 'Casual Leave', icon: Heart, color: 'emerald' },
                { key: 'earned_leave', label: 'Earned Leave', icon: Briefcase, color: 'blue' },
              ].map((item) => {
                const bal = balance?.[item.key] || { total: 0, used: 0 }
                const remaining = bal.total - bal.used
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${item.color}-500/10`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </div>
                      <span className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                        {remaining}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {bal.used} used of {bal.total}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
