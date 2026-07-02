import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../services/api'
import { ScrollText, Search, Filter, UserCheck, AlertTriangle, Users, Activity, XCircle } from 'lucide-react'

const LOG_TYPES = ['', 'recognition', 'failed_attempt', 'registration', 'system', 'error']

const typeConfig = {
  recognition: { icon: UserCheck, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Recognition' },
  failed_attempt: { icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Failed Attempt' },
  registration: { icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Registration' },
  system: { icon: Activity, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', label: 'System' },
  error: { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Error' },
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logType, setLogType] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 30

  useEffect(() => {
    loadLogs()
  }, [logType, page])

  const loadLogs = async () => {
    try {
      const res = await adminAPI.getLogs({ log_type: logType || undefined, limit, offset: page * limit })
      setLogs(res.data.logs)
      setTotal(res.data.total)
    } catch {} finally {
      setLoading(false)
    }
  }

  const filtered = search
    ? logs.filter(l =>
        (l.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.employee_id || '').toLowerCase().includes(search.toLowerCase()) ||
        l.message.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="loading-spinner w-12 h-12"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-500 dark:text-gray-400">System audit trail and event logs</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={logType}
              onChange={(e) => { setLogType(e.target.value); setPage(0) }}
              className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              <option value="">All Types</option>
              {LOG_TYPES.filter(Boolean).map((t) => (
                <option key={t} value={t}>{typeConfig[t]?.label || t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((log, i) => {
            const cfg = typeConfig[log.log_type] || typeConfig.system
            const Icon = cfg.icon
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {log.employee_name && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.employee_name} {log.employee_id && `(${log.employee_id})`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    {log.confidence_score && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {log.confidence_score}%
                      </span>
                    )}
                    {log.ip_address && (
                      <span className="text-xs text-gray-400">IP: {log.ip_address}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No logs found</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}</p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
