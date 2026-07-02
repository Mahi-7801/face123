import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { featuresAPI } from '../services/api'
import { Clock, Plus, Edit3, Trash2, X } from 'lucide-react'

export default function AdminShifts() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editShift, setEditShift] = useState(null)
  const [form, setForm] = useState({
    name: '', start_time: '', end_time: '', late_threshold: 15, description: '',
  })

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    try {
      const res = await featuresAPI.getShifts()
      setShifts(res.data.shifts)
    } catch {
      toast.error('Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditShift(null)
    setForm({ name: '', start_time: '', end_time: '', late_threshold: 15, description: '' })
    setShowModal(true)
  }

  const openEdit = (s) => {
    setEditShift(s)
    setForm({
      name: s.name,
      start_time: s.start_time,
      end_time: s.end_time,
      late_threshold: s.late_threshold,
      description: s.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.start_time || !form.end_time) {
      toast.error('Please fill required fields')
      return
    }
    try {
      if (editShift) {
        await featuresAPI.updateShift(editShift.id, form)
        toast.success('Shift updated')
      } else {
        await featuresAPI.createShift(form)
        toast.success('Shift created')
      }
      setShowModal(false)
      loadShifts()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save shift')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this shift?')) return
    try {
      await featuresAPI.deleteShift(id)
      toast.success('Shift deleted')
      loadShifts()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Define and manage work shifts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Shift
        </motion.button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Shift Name</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Start Time</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">End Time</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Late Threshold</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Active</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{s.start_time}</td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{s.end_time}</td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{s.late_threshold} min</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      s.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No shifts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg glass-card rounded-2xl p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editShift ? 'Edit Shift' : 'Add Shift'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="e.g. Morning Shift"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Late Threshold (minutes)</label>
                <input
                  type="number"
                  value={form.late_threshold}
                  onChange={(e) => setForm({ ...form, late_threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  {editShift ? 'Update Shift' : 'Create Shift'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
