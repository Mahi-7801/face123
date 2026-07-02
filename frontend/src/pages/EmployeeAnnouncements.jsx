import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { featuresAPI } from '../services/api'
import { Megaphone, Calendar, User } from 'lucide-react'
import { toast } from 'react-toastify'

const priorityStyles = {
  High: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Normal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Low: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
}

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    featuresAPI.getAnnouncements()
      .then((res) => setAnnouncements(res.data.announcements || []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
        <p className="text-gray-500 dark:text-gray-400">Company announcements and notices</p>
      </div>

      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityStyles[item.priority] || priorityStyles.Normal}`}>
                      {item.priority || 'Normal'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{item.created_by || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12 text-center"
        >
          <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Announcements</h3>
          <p className="text-gray-500 dark:text-gray-400">No announcements have been posted yet</p>
        </motion.div>
      )}
    </div>
  )
}
