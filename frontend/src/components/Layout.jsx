import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Users, ClipboardCheck, BarChart3, LogOut,
  Menu, X, Sun, Moon, Camera, ChevronDown, Wallet, ScrollText, Settings,
  CalendarDays, Clock, Megaphone, FileText, Shield
} from 'lucide-react'

const navGroups = [
  {
    label: 'Core',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/employees', icon: Users, label: 'Employees' },
      { path: '/attendance-records', icon: ClipboardCheck, label: 'Attendance' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { path: '/salary', icon: Wallet, label: 'Salary' },
      { path: '/reports', icon: BarChart3, label: 'Reports' },
      { path: '/dept-reports', icon: BarChart3, label: 'Dept Reports' },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/leaves', icon: CalendarDays, label: 'Leaves' },
      { path: '/holidays', icon: Sun, label: 'Holidays' },
      { path: '/shifts', icon: Clock, label: 'Shifts' },
      { path: '/announcements', icon: Megaphone, label: 'Announcements' },
      { path: '/documents', icon: FileText, label: 'Documents' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/logs', icon: ScrollText, label: 'Activity Logs' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const { admin, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isDesktop ? 0 : (sidebarOpen ? 0 : -280) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 w-64 z-50 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)' }}
          >
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">FaceTrack</h1>
            <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-widest">Attendance System</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-indigo-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav — scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white font-semibold shadow-inner'
                          : 'text-indigo-200 hover:bg-white/8 hover:text-white'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.12)',
                    } : {}}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={isActive
                            ? { background: 'linear-gradient(135deg,#818cf8,#a78bfa)', boxShadow: '0 4px 12px rgba(129,140,248,0.4)' }
                            : { background: 'rgba(255,255,255,0.07)' }
                          }
                        >
                          <item.icon className="w-3.5 h-3.5" />
                        </span>
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom — Admin info + actions */}
        <div className="border-t border-white/10 p-3">
          {/* Admin card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/8 mb-2"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)' }}
            >
              {admin?.full_name?.[0]?.toUpperCase() || admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">
                {admin?.full_name || admin?.username || 'Admin'}
              </p>
              <p className="text-indigo-300 text-[10px] flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Administrator
              </p>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{dark ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-xs font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main area ─── */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 glass-card rounded-none border-b border-gray-200/50 dark:border-gray-700/30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}
                  >
                    {admin?.full_name?.[0]?.toUpperCase() || admin?.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {admin?.full_name || admin?.username}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-52 glass-card rounded-2xl shadow-xl p-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/30 mb-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {admin?.full_name || admin?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
