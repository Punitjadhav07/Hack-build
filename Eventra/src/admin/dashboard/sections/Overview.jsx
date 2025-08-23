import StatsGrid from '../../../components/dashboard/StatsGrid'
import Notifications from '../../../components/dashboard/Notifications'
import UpcomingEvents from '../../../components/dashboard/UpcomingEvents'
import AdminCalendar from '../../../components/calendar/AdminCalendar'
import { getStore } from '../store'

function Overview() {
  const store = getStore()
  const stats = [
    { color: 'stat-blue', label: 'Total Events', value: store.stats.totalEvents },
    { color: 'stat-green', label: 'Total Users', value: store.stats.totalUsers },
    { color: 'stat-purple', label: 'Registrations', value: store.stats.registrations },
    { color: 'stat-red', label: 'Pending Approvals', value: store.stats.pendingApprovals },
  ].map(s => ({ ...s, color: s.color === 'stat-purple' ? 'stat-blue' : s.color }))

  // Date utility functions
  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return null
    let d
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      d = new Date(`${dateStr}T${timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr : '00:00'}:00`)
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('/')
      d = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr : '00:00'}:00`)
    } else {
      d = new Date(`${dateStr} ${timeStr || ''}`)
    }
    return isNaN(d.getTime()) ? null : d
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function formatDate(dt) {
    const dd = String(dt.getDate()).padStart(2,'0')
    const mm = String(dt.getMonth()+1).padStart(2,'0')
    const yyyy = dt.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  function formatTime(dt) {
    const hh = String(dt.getHours()).padStart(2,'0')
    const mi = String(dt.getMinutes()).padStart(2,'0')
    return `${hh}:${mi}`
  }

  // Filter upcoming events properly
  const now = new Date()
  const upcoming = store.events
    .map(e => ({ e, dt: parseDateTime(e.date, e.time) }))
    .filter(x => x.dt)
    .filter(x => x.dt >= startOfDay(now))
    .sort((a,b) => a.dt - b.dt)
    .slice(0, 2) // Show only next 2 upcoming events
    .map(({ e, dt }) => ({ 
      id: e.id, 
      title: e.title, 
      date: `${formatDate(dt)} ${formatTime(dt)}` 
    }))
  const recent = store.notifications.slice(0, 3)

  return (
    <div className="stack-lg">
      <div className="header-row">
        <div>
          <h2 className="title">Admin Dashboard</h2>
          <p className="muted">Manage events, users, and system operations</p>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <AdminCalendar />

      <div className="grid-2">
        <UpcomingEvents items={upcoming} />
        <Notifications items={recent} />
      </div>
    </div>
  )
}

export default Overview


