import StatsGrid from '../../../components/dashboard/StatsGrid'
import Notifications from '../../../components/dashboard/Notifications'
import UpcomingEvents from '../../../components/dashboard/UpcomingEvents'
import { getStore } from '../store'

function Overview() {
  const store = getStore()
  const stats = [
    { color: 'stat-blue', label: 'Total Events', value: store.stats.totalEvents },
    { color: 'stat-green', label: 'Total Users', value: store.stats.totalUsers },
    { color: 'stat-purple', label: 'Registrations', value: store.stats.registrations },
    { color: 'stat-red', label: 'Pending Approvals', value: store.stats.pendingApprovals },
  ].map(s => ({ ...s, color: s.color === 'stat-purple' ? 'stat-blue' : s.color }))

  const upcoming = store.events.slice(0, 2).map(e => ({ id: e.id, title: e.title, date: `${e.date} ${e.time}` }))
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

      <div className="grid-2">
        <UpcomingEvents items={upcoming} />
        <Notifications items={recent} />
      </div>
    </div>
  )
}

export default Overview


