import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { featuresAPI } from '../services/api'
import { CalendarDays, Plus, Trash2, Sun } from 'lucide-react'

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', name: '', is_optional: false })

  useEffect(() => {
    loadHolidays()
  }, [])

  const loadHolidays = async () => {
    try {
      const res = await featuresAPI.getHolidays()
      setHolidays(res.data.holidays)
    } catch {
      toast.error('Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.name) {
      toast.error('Please fill required fields')
      return
    }
    try {
      await featuresAPI.createHoliday(form)
      toast.success('Holiday added')
      setShowForm(false)
      setForm({ date: '', name: '', is_optional: false })
      loadHolidays()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add holiday')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return
    try {
      await featuresAPI.deleteHoliday(id)
      toast.success('Holiday deleted')
      loadHolidays()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Holiday Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage company holidays and observances</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Holiday
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Holiday Name *</label>
              <input
                type="text"
                placeholder="e.g. Diwali"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input
                type="checkbox"
                id="is_optional"
                checked={form.is_optional}
                onChange={(e) => setForm({ ...form, is_optional: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="is_optional" className="text-sm text-gray-700 dark:text-gray-300">Optional</label>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              Save
            </button>
          </form>
        </motion.div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Holiday Name</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Optional</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h, i) => (
                <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <CalendarDays className="w-4 h-4 text-primary-500" />
                      {h.date}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{h.name}</td>
                  <td className="py-3 px-3">
                    {h.is_optional ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">Optional</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">Mandatory</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No holidays found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
