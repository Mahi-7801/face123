import { createContext, useContext, useState, useEffect } from 'react'
import { employeeAuthAPI } from '../services/api'

const EmployeeAuthContext = createContext(null)

export function EmployeeAuthProvider({ children }) {
  const [employee, setEmployee] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('emp_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      employeeAuthAPI.getMe()
        .then((res) => {
          setEmployee(res.data.employee)
        })
        .catch(() => {
          localStorage.removeItem('emp_token')
          setToken(null)
          setEmployee(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (credentials) => {
    const res = await employeeAuthAPI.login(credentials)
    const { token, employee } = res.data
    localStorage.setItem('emp_token', token)
    setToken(token)
    setEmployee(employee)
    return employee
  }

  const logout = () => {
    localStorage.removeItem('emp_token')
    localStorage.removeItem('employee')
    setToken(null)
    setEmployee(null)
  }

  return (
    <EmployeeAuthContext.Provider value={{ employee, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </EmployeeAuthContext.Provider>
  )
}

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext)
  if (!context) throw new Error('useEmployeeAuth must be used within EmployeeAuthProvider')
  return context
}
