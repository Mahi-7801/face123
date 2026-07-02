import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { featuresAPI } from '../services/api'
import { BarChart3, Calendar, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDeptReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [useDateRange, setUseDateRange] = useState(false)
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' })

  useEffect(() => {
    loadReports()
  }, [filter, dateRange, useDateRange])

  const loadReports = async () => {
    try {
      const params = useDateRange
        ? { start_date: dateRange.start_date, end_date: dateRange.end_date }
        : { month: filter.month, year: filter.year }
      const res = await featuresAPI.getDeptReports(params)
      setReports(res.data.reports || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const totalEmployees = reports.reduce((s, r) => s + (r.total_employees || 0), 0)
  const totalPresent = reports.reduce((s, r) => s + (r.present_count || 0), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="loading-spinner w-12 h-12"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">Attendance analytics by department</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Date Range
            </label>
          </div>
          {useDateRange ? (
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={filter.month}
                onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
                className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
                className="w-20 px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Present</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalPresent}</p>
          </div>
        </div>

        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reports} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17,24,39,0.9)',
                  border: '1px solid rgba(55,65,81,0.5)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                }}
                formatter={(value) => [`${value}%`, 'Attendance']}
              />
              <Bar dataKey="attendance_percentage" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Department</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Total Employees</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Present</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Late</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.name || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{r.total_employees}</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{r.present_count}</td>
                  <td className="py-3 px-3 text-amber-600 dark:text-amber-400">{r.late_count}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                          style={{ width: `${Math.min(r.attendance_percentage, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(r.attendance_percentage)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No report data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
