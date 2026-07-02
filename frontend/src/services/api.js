import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('emp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('emp_token')
      localStorage.removeItem('admin')
      localStorage.removeItem('employee')
      const path = window.location.pathname
      if (path !== '/login' && !path.startsWith('/employee')) {
        window.location.href = '/login'
      } else if (path.startsWith('/employee')) {
        window.location.href = '/employee/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
}

export const employeeAPI = {
  list: () => api.get('/api/employees/'),
  get: (id) => api.get(`/api/employees/${id}`),
  register: (formData) => api.post('/api/employees/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/api/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

export const attendanceAPI = {
  recognize: (data) => api.post('/api/attendance/recognize', data),
  getToday: () => api.get('/api/attendance/today'),
  getReports: (params) => api.get('/api/attendance/reports', { params }),
  getStats: () => api.get('/api/attendance/stats'),
  exportData: (params) => api.get('/api/attendance/export', { params }),
}

export const adminAPI = {
  getProfile: () => api.get('/api/admin/profile'),
  updateProfile: (data) => api.put('/api/admin/profile', data),
  getAllEmployees: () => api.get('/api/admin/employees'),
  getSalaryPayments: (params) => api.get('/api/admin/salary/payments', { params }),
  createSalaryPayment: (data) => api.post('/api/admin/salary/payments', data),
  updateSalaryPayment: (id, data) => api.put(`/api/admin/salary/payments/${id}`, data),
  deleteSalaryPayment: (id) => api.delete(`/api/admin/salary/payments/${id}`),
  getLogs: (params) => api.get('/api/admin/logs', { params }),
}

export const employeeAuthAPI = {
  login: (credentials) => api.post('/api/employee/login', credentials),
  getMe: () => api.get('/api/employee/me'),
  updateProfile: (data) => api.put('/api/employee/profile', data),
  getDashboard: () => api.get('/api/employee/dashboard'),
  getSalary: (params) => api.get('/api/employee/salary', { params }),
  getCalendar: (params) => api.get('/api/employee/attendance/calendar', { params }),
}

export const featuresAPI = {
  // Leaves
  applyLeave: (data) => api.post('/api/leaves/apply', data),
  getMyLeaves: (params) => api.get('/api/leaves/my', { params }),
  getLeaveBalance: () => api.get('/api/leaves/balance'),
  getAdminLeaves: (params) => api.get('/api/admin/leaves', { params }),
  updateLeaveStatus: (id, data) => api.put(`/api/admin/leaves/${id}/status`, data),
  // Holidays
  getHolidays: (params) => api.get('/api/holidays', { params }),
  createHoliday: (data) => api.post('/api/admin/holidays', data),
  deleteHoliday: (id) => api.delete(`/api/admin/holidays/${id}`),
  // Shifts
  getShifts: () => api.get('/api/shifts'),
  createShift: (data) => api.post('/api/admin/shifts', data),
  updateShift: (id, data) => api.put(`/api/admin/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/api/admin/shifts/${id}`),
  assignShift: (empId, shiftId) => api.put(`/api/admin/employees/${empId}/shift`, { shift_id: shiftId }),
  getMyShift: () => api.get('/api/employee/shift'),
  // Announcements
  getAnnouncements: (params) => api.get('/api/announcements', { params }),
  createAnnouncement: (data) => api.post('/api/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/api/admin/announcements/${id}`),
  // Documents
  uploadDocument: (formData) => api.post('/api/admin/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAdminDocuments: (params) => api.get('/api/admin/documents', { params }),
  getMyDocuments: () => api.get('/api/employee/documents'),
  deleteDocument: (id) => api.delete(`/api/admin/documents/${id}`),
  // Department Reports
  getDeptReports: (params) => api.get('/api/admin/reports/departments', { params }),
}

export default api
