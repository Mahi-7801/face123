import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useEmployeeAuth } from '../context/EmployeeAuthContext'
import { employeeAuthAPI } from '../services/api'
import { CheckCircle, Clock, CalendarDays, TrendingUp } from 'lucide-react'

export default function EmployeeDashboard() {
  const { employee } = useEmployeeAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeeAuthAPI.getDashboard()
      .then((res) => setData(res.data.dashboard))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  const todayLabel = data?.today_record?.check_out
    ? 'Checked Out'
    : data?.today_marked
    ? 'Checked In'
    : 'Not Marked'
  const stats = [
    { label: 'Total Present', value: data?.total_present || 0, icon: CheckCircle, color: 'emerald' },
    { label: 'This Month', value: data?.this_month_present || 0, icon: CalendarDays, color: 'blue' },
    { label: 'Today', value: todayLabel, icon: Clock, color: data?.today_record?.check_out ? 'purple' : data?.today_marked ? 'emerald' : 'amber' },
    { label: 'Recognition Rate', value: '--', icon: TrendingUp, color: 'purple' },
  ]

  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {employee?.employee_name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {employee?.designation} - {employee?.department}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${colorClasses[stat.color]?.bg || 'bg-emerald-500/10'} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${colorClasses[stat.color]?.text || 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {data?.today_record && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Today's Attendance</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {data.today_record.status}
              </p>
              <p className="text-sm text-gray-500">
                Check-in: {data.today_record.check_in}
                {data.today_record.check_out ? ` | Check-out: ${data.today_record.check_out}` : ' | Not checked out yet'}
                {data.today_record.total_hours ? ` | Hours: ${data.today_record.total_hours.toFixed(1)}` : ''}
                {data.today_record.confidence && ` | Confidence: ${data.today_record.confidence.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {data?.recent_attendance && data.recent_attendance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Check-in</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Check-out</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Hours</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_attendance.map((record, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{record.date}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.check_in}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.check_out || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        record.status === 'Late' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {!data?.today_marked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400">
            Attendance not marked today. Please use the attendance screen to mark your attendance.
          </p>
        </motion.div>
      )}
    </div>
  )
}
