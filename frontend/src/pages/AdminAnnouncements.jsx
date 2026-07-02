import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { featuresAPI } from '../services/api'
import { Megaphone, Plus, Trash2, Send } from 'lucide-react'

const PRIORITY_COLORS = {
  Low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  Normal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', priority: 'Normal' })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const res = await featuresAPI.getAnnouncements()
      setAnnouncements(res.data.announcements)
    } catch {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.message) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await featuresAPI.createAnnouncement(form)
      toast.success('Announcement created')
      setShowForm(false)
      setForm({ title: '', message: '', priority: 'Normal' })
      loadAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create announcement')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await featuresAPI.deleteAnnouncement(id)
      toast.success('Announcement deleted')
      loadAnnouncements()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="loading-spinner w-12 h-12"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage company-wide announcements</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                rows={3}
                placeholder="Write your announcement..."
              />
            </div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publish
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {announcements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.Normal}`}>
                    {a.priority}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{a.message}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>By {a.created_by || 'Admin'}</span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center text-gray-400">No announcements found</div>
        )}
      </div>
    </div>
  )
}
