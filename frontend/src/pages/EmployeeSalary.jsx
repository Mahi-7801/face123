import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { employeeAuthAPI } from '../services/api'
import { Wallet, Landmark, CreditCard, BadgeCheck, Download } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function EmployeeSalary() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeeAuthAPI.getSalary()
      .then((res) => setData(res.data))
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary</h1>
        <p className="text-gray-500 dark:text-gray-400">Your salary and payment details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Salary</h2>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{data?.current_salary?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly base salary</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment History</h2>
            {data?.payments && data.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Period</th>
                      <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Deductions</th>
                      <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Net</th>
                      <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">{MONTHS[p.month - 1]} {p.year}</td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-red-600">₹{p.deductions.toLocaleString()}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">₹{p.net_amount.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            p.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No payment records found</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bank Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data?.bank_name || '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data?.bank_account || '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">IFSC Code</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data?.ifsc_code || '--'}</p>
                </div>
              </div>
            </div>
          </div>

          {(data?.uan_number || data?.pf_number) && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Statutory Details</h2>
              {data?.uan_number && (
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">UAN Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.uan_number}</p>
                  </div>
                </div>
              )}
              {data?.pf_number && (
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PF Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.pf_number}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
