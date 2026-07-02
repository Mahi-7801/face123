import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { adminAPI } from '../services/api'
import { Wallet, Plus, Search, Edit3, Trash2, X, CheckCircle } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminSalary() {
  const [employees, setEmployees] = useState([])
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editPayment, setEditPayment] = useState(null)
  const [search, setSearch] = useState('')
  const [filterEmp, setFilterEmp] = useState('')
  const [form, setForm] = useState({
    employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    amount: '', deductions: '0', status: 'Pending', payment_date: '', remarks: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let f = payments
    if (filterEmp) f = f.filter(p => p.employee_id === filterEmp)
    if (search) f = f.filter(p =>
      p.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      p.employee_id.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredPayments(f)
  }, [payments, filterEmp, search])

  const loadData = async () => {
    try {
      const [empRes, payRes] = await Promise.all([
        adminAPI.getAllEmployees(),
        adminAPI.getSalaryPayments(),
      ])
      setEmployees(empRes.data.employees)
      setPayments(payRes.data.payments)
      setFilteredPayments(payRes.data.payments)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditPayment(null)
    setForm({
      employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
      amount: '', deductions: '0', status: 'Pending', payment_date: new Date().toISOString().split('T')[0], remarks: '',
    })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditPayment(p)
    setForm({
      employee_id: p.employee_id, month: p.month, year: p.year,
      amount: String(p.amount), deductions: String(p.deductions),
      status: p.status, payment_date: p.payment_date || '', remarks: p.remarks || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id || !form.amount) {
      toast.error('Please fill required fields')
      return
    }
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        deductions: parseFloat(form.deductions) || 0,
      }
      if (editPayment) {
        await adminAPI.updateSalaryPayment(editPayment.id, payload)
        toast.success('Payment updated')
      } else {
        await adminAPI.createSalaryPayment(payload)
        toast.success('Payment added')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment record?')) return
    try {
      await adminAPI.deleteSalaryPayment(id)
      toast.success('Payment deleted')
      loadData()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage employee salary payments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Payment
        </motion.button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <select
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
            className="px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.employee_id} value={e.employee_id}>{e.employee_name} ({e.employee_id})</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Employee</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Period</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Deductions</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Net Amount</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{p.employee_name}</p>
                      <p className="text-xs text-gray-500">{p.employee_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">{MONTHS[p.month - 1]} {p.year}</td>
                  <td className="py-3 px-3 text-gray-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                  <td className="py-3 px-3 text-red-600">₹{p.deductions.toLocaleString()}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">₹{p.net_amount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      p.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No salary payments found</td></tr>
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
                {editPayment ? 'Edit Payment' : 'Add Salary Payment'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  disabled={!!editPayment}
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>{e.employee_name} ({e.employee_id})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductions</label>
                  <input
                    type="number"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
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
                  <CheckCircle className="w-4 h-4" />
                  {editPayment ? 'Update' : 'Add Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
