import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useEmployeeAuth } from './context/EmployeeAuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import AttendanceScreen from './pages/AttendanceScreen'
import Reports from './pages/Reports'
import Layout from './components/Layout'
import AdminSalary from './pages/AdminSalary'
import AdminLogs from './pages/AdminLogs'
import AdminSettings from './pages/AdminSettings'
import EmployeeLogin from './pages/EmployeeLogin'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeSettings from './pages/EmployeeSettings'
import EmployeeSalary from './pages/EmployeeSalary'
import EmployeeAttendance from './pages/EmployeeAttendance'
import EmployeeLayout from './components/EmployeeLayout'
import AdminLeaves from './pages/AdminLeaves'
import AdminHolidays from './pages/AdminHolidays'
import AdminShifts from './pages/AdminShifts'
import AdminAnnouncements from './pages/AdminAnnouncements'
import AdminDocuments from './pages/AdminDocuments'
import AdminDeptReports from './pages/AdminDeptReports'
import EmployeeLeave from './pages/EmployeeLeave'
import EmployeeAnnouncements from './pages/EmployeeAnnouncements'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function EmployeeProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useEmployeeAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/employee/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/attendance" element={<AttendanceScreen />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="employee" element={<Navigate to="/employees" replace />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance-records" element={<Attendance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="salary" element={<AdminSalary />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="leaves" element={<AdminLeaves />} />
        <Route path="holidays" element={<AdminHolidays />} />
        <Route path="shifts" element={<AdminShifts />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="dept-reports" element={<AdminDeptReports />} />
      </Route>
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee" element={
        <EmployeeProtectedRoute>
          <EmployeeLayout />
        </EmployeeProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="settings" element={<EmployeeSettings />} />
        <Route path="salary" element={<EmployeeSalary />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="announcements" element={<EmployeeAnnouncements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
