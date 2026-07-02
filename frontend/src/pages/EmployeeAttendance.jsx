import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { employeeAuthAPI } from '../services/api'
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function EmployeeAttendance() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    employeeAuthAPI.getCalendar({ month, year })
      .then((res) => setData(res.data.calendar))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [month, year])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else setMonth(month - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else setMonth(month + 1)
  }

  const daysInMonth = data?.total_days || new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const getDayStatus = (day) => {
    if (data?.present_days?.includes(day)) return 'present'
    if (data?.late_days?.includes(day)) return 'late'
    if (data?.half_days?.includes(day)) return 'half'
    return null
  }

  const getRecordForDay = (day) => {
    return data?.records?.find(r => r.day === day)
  }

  const summary = {
    present: data?.present_days?.length || 0,
    late: data?.late_days?.length || 0,
    half: data?.half_days?.length || 0,
    absent: (data?.total_days || daysInMonth) - (data?.present_days?.length || 0) - (data?.late_days?.length || 0) - (data?.half_days?.length || 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-gray-500 dark:text-gray-400">Your attendance calendar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: summary.present, cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Late', value: summary.late, cls: 'text-amber-600 dark:text-amber-400' },
          { label: 'Half Day', value: summary.half, cls: 'text-purple-600 dark:text-purple-400' },
          { label: 'Absent', value: summary.absent, cls: 'text-red-600 dark:text-red-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <p className={`text-2xl font-bold ${item.cls}`}>{item.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{MONTHS[month - 1]} {year}</h2>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            const status = day ? getDayStatus(day) : null
            const record = day ? getRecordForDay(day) : null
            return (
              <div key={i} className="aspect-square p-1">
                {day && (
                  <div
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                      status === 'present'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : status === 'late'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : status === 'half'
                        ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    title={record ? `${record.check_in} - ${record.check_out || 'not out'} (${record.total_hours ? record.total_hours + 'h' : '-'})` : ''}
                  >
                    <span className="font-medium">{day}</span>
                    {status && (
                      <span className="text-[10px] mt-0.5">
                        {status === 'present' ? '✓' : status === 'late' ? '!' : '½'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Present
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-amber-500" /> Late
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-purple-500" /> Half Day
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <XCircle className="w-4 h-4 text-red-500" /> Absent
          </div>
        </div>
      </motion.div>

      {data?.records && data.records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Day</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Check-in</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Check-out</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Hours</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{r.day}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{MONTHS[month - 1]} {r.day}, {year}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{r.check_in}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{r.check_out || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{r.total_hours ? `${r.total_hours.toFixed(1)}h` : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        r.status === 'Late' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        r.status === 'Half-Day' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
