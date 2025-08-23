import { useEffect, useMemo, useState } from 'react'
import './dashboard.css'
import StatsGrid from '../components/dashboard/StatsGrid'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import Notifications from '../components/dashboard/Notifications'
import EventCards from '../components/dashboard/EventCards'
import UserCalendar from '../components/calendar/UserCalendar'
import NotificationPopup from '../components/dashboard/NotificationPopup'
import { getStore, registerForEvent, getUserEvents, seedIfEmpty, migrateStore, addFeedback, getFeedbackForEvent, updateStore } from '../admin/dashboard/store'
import QRCode from 'qrcode'

function Dashboard({ onLogout, stats, upcomingEvents, notifications, events }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [tick, setTick] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [qrByEventId, setQrByEventId] = useState({})
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    document.title = 'Eventra • Dashboard'
    seedIfEmpty()
    migrateStore()
    const listener = () => setTick(t => t + 1)
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }, [])

  const store = getStore()
  const allNotifications = (notifications || store.notifications || [])
  const unreadNotifications = allNotifications.filter(n => n.unread).length

  const handleMarkNotificationAsRead = (notificationId) => {
    updateStore(store => {
      store.notifications = store.notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
      return store
    })
    
    // Trigger re-render
    setTick(t => t + 1)
  }

  const handleDeleteNotification = (notificationId) => {
    updateStore(store => {
      store.notifications = store.notifications.filter(notification => 
        notification.id !== notificationId
      )
      return store
    })
    
    // Trigger re-render
    setTick(t => t + 1)
  }

  function handleRegisterEvent(ev) {
    if (!currentUser) return
    registerForEvent(currentUser.id || currentUser.email, ev.id)
    setSelectedEvent({ ...ev, status: 'registered' })
    setActiveTab('events')
  }

  function handleFeedback(event, feedbackData) {
    if (!currentUser) return
    addFeedback({
      eventId: event.id,
      userId: currentUser.id || currentUser.email,
      userName: currentUser.name || 'Anonymous',
      rating: feedbackData.rating,
      comment: feedbackData.comment
    })
    // Trigger a re-render
    setTick(t => t + 1)
  }



  const myEvents = getUserEvents(currentUser?.id || currentUser?.email)
  const publishedEvents = store.events.filter(e => e.status === 'published')
  const calcSpots = (e) => Math.max(0, (e.capacity || 0) - (e.registered || 0))

  // Get feedback data for events
  const feedbackByEvent = {}
  store.feedback.forEach(f => {
    if (!feedbackByEvent[f.eventId]) {
      feedbackByEvent[f.eventId] = []
    }
    feedbackByEvent[f.eventId].push(f)
  })

  // --- Date utilities to normalize various date/time inputs ---
  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return null
    // Prefer ISO yyyy-mm-dd
    let d
    // If browser date input value like 2025-12-10
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      d = new Date(`${dateStr}T${timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr : '00:00'}:00`)
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      // dd/mm/yyyy
      const [dd, mm, yyyy] = dateStr.split('/')
      d = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr : '00:00'}:00`)
    } else {
      // Fallback: Date understands many formats like 'Jan 15, 2024'
      d = new Date(`${dateStr} ${timeStr || ''}`)
    }
    return isNaN(d.getTime()) ? null : d
  }

  function isWithinNextNDays(dt, n) {
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + n)
    return dt >= startOfDay(now) && dt <= end
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

  // Generate QR codes for user's tickets using local qrcode library
  useEffect(() => {
    async function generateQrs() {
      try {
        const next = {}
        for (const e of myEvents) {
          const payload = JSON.stringify({
            type: 'eventra-ticket',
            eventId: e.id,
            eventTitle: e.title,
            userId: currentUser?.id || currentUser?.email,
            userName: currentUser?.name || 'User',
          })
          next[e.id] = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 256 })
        }
        setQrByEventId(next)
      } catch (err) {
        console.error('Error generating QR codes:', err)
      }
    }
    if (myEvents.length > 0) generateQrs()
  }, [myEvents.length, currentUser?.id, currentUser?.email, currentUser?.name])



  return (
    <div className="dash-root" key={tick}>
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="brand">Eventra</h1>
          <span className="muted">Dashboard</span>
        </div>
        <div className="dash-header-right">
          <button 
            className="icon-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotificationPopup(true)}
          >
            <span className="bell">🔔</span>
            {unreadNotifications > 0 && (
              <span className="badge">{unreadNotifications}</span>
            )}
          </button>
          <div className="profile">
            <div className="avatar">{(currentUser?.name || 'U').split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
            <div className="profile-meta">
              <p className="profile-name">{currentUser?.name || 'Guest User'}</p>
              <p className="profile-id">STU001234</p>
            </div>
          </div>
          <button className="logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dash-body">
        {/* Sidebar */}
        <aside className="sidebar">
          {['overview','events','browse','schedule','tickets'].map(tab => (
            <button
              key={tab}
              className={`side-btn ${activeTab===tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'events' && 'My Events'}
              {tab === 'browse' && 'Browse Events'}
              {tab === 'schedule' && 'Schedule'}
              {tab === 'tickets' && 'Digital Tickets'}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="main">
          {activeTab === 'overview' && (
            <div className="stack-lg">
              <div className="header-row">
                <div>
                  <h2 className="title">Welcome back, {currentUser?.name || 'Guest'}!</h2>
                  <p className="muted">Here's what's happening with your events and assignments.</p>
                </div>
                <button className="primary" onClick={() => setActiveTab('browse')}>+ Register for Event</button>
              </div>

              {/* Quick Stats */}
              <StatsGrid stats={stats || [
                { color: 'stat-blue', label: 'Registered Events', value: myEvents.length },
                { color: 'stat-green', label: 'Active Tickets', value: myEvents.length },
                { color: 'stat-orange', label: 'Pending Assignments', value: 0 },
                { color: 'stat-red', label: 'Notifications', value: unreadNotifications },
              ]} />

              <UserCalendar currentUser={currentUser} />

              <div className="grid-2">
                <UpcomingEvents items={upcomingEvents || (() => {
                  const now = new Date()
                  const upcoming = myEvents
                    .map(e => ({ e, dt: parseDateTime(e.date, e.time) }))
                    .filter(x => x.dt)
                    .filter(x => x.dt >= startOfDay(now))
                    .sort((a,b) => a.dt - b.dt)
                    .slice(0, 3) // Show only next 3 upcoming events
                    .map(({ e, dt }) => ({ 
                      id: e.id, 
                      title: e.title, 
                      date: `${formatDate(dt)} ${formatTime(dt)}` 
                    }))
                  return upcoming
                })()} />
                <Notifications items={(notifications || store.notifications || []).map(n => ({...n, message: n.message || n.msg }))} />
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="stack-lg">
              <div className="header-row">
                <h2 className="title">My Events</h2>
                <button className="primary" onClick={() => setActiveTab('browse')}>+ Find New Events</button>
              </div>
              <EventCards
                events={myEvents.map(e => ({
                  id: e.id,
                  status: 'registered',
                  type: e.type,
                  title: e.title,
                  description: e.description,
                  date: e.date,
                  time: e.time,
                  location: e.location,
                  availableSpots: calcSpots(e),

                }))}
                onRegister={() => {}}
                onFeedback={handleFeedback}
                onSelect={(ev) => setSelectedEvent(ev)}

                feedbackByEvent={feedbackByEvent}
                currentUser={currentUser}
              />
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="stack-lg">
              <div className="header-row">
                <h2 className="title">Browse Events</h2>
              </div>
              <EventCards
                events={publishedEvents.map(e => ({
                  id: e.id,
                  status: 'upcoming',
                  type: e.type,
                  title: e.title,
                  description: e.description,
                  date: e.date,
                  time: e.time,
                  location: e.location,
                  availableSpots: calcSpots(e),

                }))}
                onRegister={(ev) => handleRegisterEvent(ev)}
                onFeedback={handleFeedback}
                onSelect={(ev) => setSelectedEvent(ev)}

                feedbackByEvent={feedbackByEvent}
                currentUser={currentUser}
              />
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="stack-lg">
              <div className="header-row">
                <h2 className="title">Digital Tickets</h2>
                <p className="panel-d">Your QR code tickets for registered events</p>
              </div>
              <div className="grid-2">
                {myEvents.length === 0 ? (
                  <div className="empty-state" style={{gridColumn:'1 / -1'}}><p>No tickets yet</p></div>
                ) : myEvents.map(e => (
                  <div key={e.id} className="panel">
                    <div className="panel-h">
                      <h3 className="panel-t">{e.title}</h3>
                      <p className="panel-d">{e.date} • {e.time} • {e.location}</p>
                    </div>
                    <div className="list">
                      <div className="list-row" style={{justifyContent:'center'}}>
                        {qrByEventId[e.id] ? (
                          <img src={qrByEventId[e.id]} alt={`QR for ${e.title}`} style={{height:180,width:180}} />
                        ) : (
                          <div className="empty-state"><p>Generating QR…</p></div>
                        )}
                      </div>
                      <div className="list-row">
                        <div className="flex-1">
                          <p className="row-title">Ticket Holder</p>
                          <p className="row-sub">{currentUser?.name} • ID: {currentUser?.id || currentUser?.email}</p>
                        </div>
                        <button className="btn btn-outline" onClick={() => setSelectedEvent(e)}>Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="stack-lg">
              <div className="header-row"><h2 className="title">My Schedule</h2></div>
              <div className="panel">
                <div className="panel-h">
                  <h3 className="panel-t">Upcoming</h3>
                  <p className="panel-d">All future events in chronological order</p>
                </div>
                <div className="list">
                  {(() => {
                    const now = new Date()
                    const upcoming = myEvents
                      .map(e => ({ e, dt: parseDateTime(e.date, e.time) }))
                      .filter(x => x.dt)
                      .filter(x => x.dt >= startOfDay(now))
                      .sort((a,b) => a.dt - b.dt)

                    if (upcoming.length === 0) {
                      return <div className="empty-state"><p>No upcoming events</p></div>
                    }

                    return upcoming.map(({ e, dt }) => (
                      <div key={e.id} className="list-row">
                        <div className="flex-1">
                          <p className="row-title">{e.title}</p>
                          <p className="row-sub">{formatDate(dt)} • {formatTime(dt)} • {e.location}</p>
                        </div>
                        <button className="btn btn-outline" onClick={() => setSelectedEvent(e)}>Details</button>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          )}

          {selectedEvent && (
            <div className="panel" style={{position:'fixed',right:16,bottom:16,maxWidth:420,zIndex:50}}>
              <div className="panel-h">
                <h3 className="panel-t">Event Details</h3>
                <p className="panel-d">Quick summary</p>
              </div>
              <div className="list">
                <div className="list-row">
                  <div className="flex-1">
                    <p className="row-title">{selectedEvent.title}</p>
                    <p className="row-sub">{selectedEvent.description || 'No description provided'}</p>
                    <p className="row-sub">Type: {selectedEvent.type || 'general'}</p>
                    <p className="row-sub">📅 {selectedEvent.date || '-'} ⏰ {selectedEvent.time || '-'}</p>
                    <p className="row-sub">📍 {selectedEvent.location || '-'}</p>
                    <p className="row-sub">Capacity: {selectedEvent.capacity ?? 0} • Registered: {selectedEvent.registered ?? 0}</p>
                  </div>
                  <button className="btn" onClick={() => setSelectedEvent(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Popup */}
          {showNotificationPopup && (
            <NotificationPopup
              notifications={allNotifications}
              onClose={() => setShowNotificationPopup(false)}
              onMarkAsRead={handleMarkNotificationAsRead}
              onDeleteNotification={handleDeleteNotification}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard


