import { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import { CalendarProvider } from './context/CalendarContext'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    // Handle navigation
    const handleNavigation = () => {
      const path = window.location.pathname
      if (path === '/signup') {
        setCurrentPage('signup')
      } else {
        setCurrentPage('login')
      }
    }

    handleNavigation()
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  const navigateTo = (page) => {
    setCurrentPage(page)
    if (page === 'signup') {
      window.history.pushState({}, '', '/signup')
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setCurrentPage('login')
    window.history.pushState({}, '', '/')
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
  }

  // If user is logged in, show appropriate dashboard
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <CalendarProvider>
          <AdminDashboard onLogout={handleLogout} />
        </CalendarProvider>
      )
    }
    return (
      <CalendarProvider>
        <Dashboard onLogout={handleLogout} />
      </CalendarProvider>
    )
  }

  return (
    <CalendarProvider>
      {currentPage === 'login' ? (
        <Login onNavigateToSignup={() => navigateTo('signup')} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Signup onNavigateToLogin={() => navigateTo('login')} />
      )}
    </CalendarProvider>
  )
}

export default App
