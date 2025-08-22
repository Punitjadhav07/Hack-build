import { useMemo, useState, useEffect } from 'react'
import './dashboard.css'
import StatsGrid from '../components/dashboard/StatsGrid'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import Notifications from '../components/dashboard/Notifications'
import EventCards from '../components/dashboard/EventCards'
import Dashboard from './Dashboard'
import Overview from '../admin/dashboard/sections/Overview'
import Events from '../admin/dashboard/sections/Events'
import Users from '../admin/dashboard/sections/Users'
import NotificationsCenter from '../admin/dashboard/sections/Notifications'
import QRScanner from '../admin/dashboard/sections/QRScanner'

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [viewAsUser, setViewAsUser] = useState(false)
  const [tick, setTick] = useState(0)

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const listener = () => setTick(t => t + 1)
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }, [])

  if (viewAsUser) {
    return (
      <div>
        <div style={{display:'flex',justifyContent:'center',padding:'8px'}}>
          <button className="btn" onClick={() => setViewAsUser(false)}>Exit user preview</button>
        </div>
        <Dashboard onLogout={onLogout} />
      </div>
    )
  }

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="brand">Eventra</h1>
          <span className="muted">Admin Dashboard</span>
        </div>
        <div className="dash-header-right">
          <button className="btn" onClick={() => setViewAsUser(true)}>Switch to User View</button>
          <div className="profile">
            <div className="avatar">{(currentUser?.name || 'A').split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
            <div className="profile-meta">
              <p className="profile-name">{currentUser?.name || 'Admin'}</p>
              <p className="profile-id">Administrator</p>
            </div>
          </div>
          <button className="logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dash-body">
        <aside className="sidebar">
          {['overview','events','users','notifications','qrscanner'].map(tab => (
            <button
              key={tab}
              className={`side-btn ${activeTab===tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'events' && 'Event Management'}
              {tab === 'users' && 'User Management'}
              {tab === 'notifications' && 'Notifications'}
              {tab === 'qrscanner' && 'QR Scanner'}
            </button>
          ))}
        </aside>

        <main className="main">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'events' && <Events />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'notifications' && <NotificationsCenter />}
          {activeTab === 'qrscanner' && <QRScanner />}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard


