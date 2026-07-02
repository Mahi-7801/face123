import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEmployeeAuth } from '../context/EmployeeAuthContext'
import { employeeAuthAPI } from '../services/api'
import { toast } from 'react-toastify'
import { Save, Eye, EyeOff } from 'lucide-react'

export default function EmployeeSettings() {
  const { employee, logout } = useEmployeeAuth()
  const [form, setForm] = useState({
    employee_name: employee?.employee_name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {}
      if (form.employee_name !== employee?.employee_name) payload.employee_name = form.employee_name
      if (form.phone !== employee?.phone) payload.phone = form.phone
      if (form.email !== employee?.email) payload.email = form.email
      if (passwordForm.current_password && passwordForm.new_password) {
        payload.current_password = passwordForm.current_password
        payload.new_password = passwordForm.new_password
      }
      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save')
        return
      }
      await employeeAuthAPI.updateProfile(payload)
      toast.success('Profile updated successfully')
      setPasswordForm({ current_password: '', new_password: '' })
      logout()
      toast.info('Please login again')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Update your profile information</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employee Name
          </label>
          <input
            type="text"
            name="employee_name"
            value={form.employee_name}
            onChange={handleChange}
            className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              name="current_password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all pr-12"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            name="new_password"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
