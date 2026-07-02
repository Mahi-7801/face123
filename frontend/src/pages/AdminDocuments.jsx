import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { adminAPI, featuresAPI } from '../services/api'
import { FileText, Upload, Trash2, Search, Download } from 'lucide-react'

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadForm, setUploadForm] = useState({
    employee_id: '', document_type: '', file: null,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [empRes, docRes] = await Promise.all([
        adminAPI.getAllEmployees(),
        featuresAPI.getAdminDocuments(),
      ])
      setEmployees(empRes.data.employees)
      setDocuments(docRes.data.documents)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.employee_id || !uploadForm.document_type || !uploadForm.file) {
      toast.error('Please fill all fields')
      return
    }
    const fd = new FormData()
    fd.append('employee_id', uploadForm.employee_id)
    fd.append('document_type', uploadForm.document_type)
    fd.append('file', uploadForm.file)
    try {
      await featuresAPI.uploadDocument(fd)
      toast.success('Document uploaded')
      setShowUpload(false)
      setUploadForm({ employee_id: '', document_type: '', file: null })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await featuresAPI.deleteDocument(id)
      toast.success('Document deleted')
      loadData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = search
    ? documents.filter(d =>
        d.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.document_type?.toLowerCase().includes(search.toLowerCase()) ||
        d.file_name?.toLowerCase().includes(search.toLowerCase())
      )
    : documents

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="loading-spinner w-12 h-12"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload and manage employee documents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </motion.button>
      </div>

      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select
                  value={uploadForm.employee_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, employee_id: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>{e.employee_name} ({e.employee_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type *</label>
                <input
                  type="text"
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="e.g. ID Proof, Resume"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="w-full px-4 py-2 glass-input rounded-xl text-gray-900 dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-500/10 file:text-primary-600 dark:file:text-primary-400 file:text-sm file:font-medium hover:file:bg-primary-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowUpload(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 gradient-primary rounded-xl text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Employee</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Document Type</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">File Name</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Uploaded</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{d.employee_name}</p>
                      <p className="text-xs text-gray-500">{d.employee_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-500" />
                      <span className="text-gray-900 dark:text-white">{d.document_type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{d.file_name}</td>
                  <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`${API_BASE}/api/admin/documents/${d.id}/download`}
                        className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500"
                        title="Download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No documents found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
