import { useState, useEffect } from 'react'
import { getStore, deleteEvent, updateEvent, addEvent, getFeedbackForEvent, addSampleFeedbackData } from '../store'
import EventCards from '../../../components/dashboard/EventCards'

function Events() {
  const store = getStore()
  const [showModal, setShowModal] = useState(false)
  const [hideEndedEvents, setHideEndedEvents] = useState(() => {
    // Get user preference from localStorage
    const saved = localStorage.getItem('admin-hide-ended-events')
    return saved ? JSON.parse(saved) : false
  })
  const [hiddenEvents, setHiddenEvents] = useState(() => {
    // Get hidden events from localStorage
    const saved = localStorage.getItem('admin-hidden-events')
    return saved ? JSON.parse(saved) : []
  })
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', type: 'general', capacity: 50
  })
  
  // Add sample feedback data on component mount
  useEffect(() => {
    addSampleFeedbackData()
  }, [])
  
  // Get feedback data for events
  const feedbackByEvent = {}
  store.feedback.forEach(f => {
    if (!feedbackByEvent[f.eventId]) {
      feedbackByEvent[f.eventId] = []
    }
    feedbackByEvent[f.eventId].push(f)
  })
  
  const allEvents = store.events.map(e => ({
    id: e.id,
    status: e.status,
    type: e.type || 'general',
    title: e.title,
    description: e.description || '',
    date: e.date,
    time: e.time,
    location: e.location,
    availableSpots: Math.max(0, (e.capacity || 0) - (e.registered || 0)),
  }))

  // Filter events based on hideEndedEvents setting and hidden events
  const visibleEvents = hideEndedEvents 
    ? allEvents.filter(e => e.status !== 'attended')
    : allEvents

  const events = visibleEvents.filter(e => !hiddenEvents.includes(e.id))
  const endedEventsCount = allEvents.filter(e => e.status === 'attended').length
  const hiddenEventsCount = hiddenEvents.length

  const handleToggleHideEndedEvents = () => {
    const newValue = !hideEndedEvents
    setHideEndedEvents(newValue)
    // Save user preference to localStorage
    localStorage.setItem('admin-hide-ended-events', JSON.stringify(newValue))
  }

  const handleHideEvent = (event) => {
    const newHiddenEvents = [...hiddenEvents, event.id]
    setHiddenEvents(newHiddenEvents)
    localStorage.setItem('admin-hidden-events', JSON.stringify(newHiddenEvents))
  }

  const handleShowHiddenEvents = () => {
    setHiddenEvents([])
    localStorage.setItem('admin-hidden-events', JSON.stringify([]))
  }

  const handleDeleteEvent = (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      deleteEvent(event.id)
      // Also remove from hidden events if it was there
      setHiddenEvents(prev => prev.filter(id => id !== event.id))
      localStorage.setItem('admin-hidden-events', JSON.stringify(hiddenEvents.filter(id => id !== event.id)))
    }
  }

  function handleRegister(ev) {
    // Toggle between published and attended status
    if (ev.status === 'published') {
      updateEvent({ id: ev.id, status: 'attended' })
    } else if (ev.status === 'attended') {
      updateEvent({ id: ev.id, status: 'published' })
    } else {
      updateEvent({ id: ev.id, status: 'published' })
    }
    window.dispatchEvent(new Event('storage'))
  }

  function handleFeedback(ev) {
    // repurpose as quick delete for demo
    deleteEvent(ev.id)
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="stack-lg">
      <div className="header-row">
        <div>
          <h2 className="title">Event Management</h2>
          <p className="muted">Manage all events and their status</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${hideEndedEvents ? 'primary' : 'btn-outline'}`}
            onClick={handleToggleHideEndedEvents}
            title={hideEndedEvents ? 'Show ended events' : 'Hide ended events'}
          >
            {hideEndedEvents ? '👁️ Show Ended' : '🙈 Hide Ended'}
            {endedEventsCount > 0 && (
              <span className="event-count-badge">({endedEventsCount})</span>
            )}
          </button>
          {hiddenEventsCount > 0 && (
            <button 
              className="btn btn-outline event-show-hidden-btn"
              onClick={handleShowHiddenEvents}
              title="Show all hidden events"
            >
              👁️ Show Hidden ({hiddenEventsCount})
            </button>
          )}
          <button className="primary" onClick={() => setShowModal(true)}>+ Create Event</button>
        </div>
              </div>
        
        {/* Show summary when ended events are hidden */}
        {hideEndedEvents && endedEventsCount > 0 && (
          <div className="event-summary-panel">
            <div className="event-summary-content">
              <span className="event-summary-icon">🙈</span>
              <div className="event-summary-text">
                <strong>{endedEventsCount} ended event{endedEventsCount !== 1 ? 's' : ''}</strong> are currently hidden
                <button 
                  className="event-summary-show-btn"
                  onClick={handleToggleHideEndedEvents}
                >
                  Show them
                </button>
              </div>
            </div>
          </div>
        )}
        
        <EventCards 
          events={events} 
          onRegister={handleRegister} 
          onFeedback={handleFeedback}
          onHide={handleHideEvent}
          onDelete={handleDeleteEvent}
          feedbackByEvent={feedbackByEvent}
          isAdmin={true}
        />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-h">
              <h3 className="panel-t">Create New Event</h3>
              <p className="panel-d">Fill the details below</p>
            </div>
            <div className="list form-grid">
              <div>
                <p className="row-title">Title</p>
                <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              </div>
              <div>
                <p className="row-title">Description</p>
                <textarea className="input" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
              <div className="form-row">
                <div>
                  <p className="row-title">Date</p>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={e=>setForm({...form,date:e.target.value})}
                  />
                </div>
                <div>
                  <p className="row-title">Time</p>
                  <input
                    className="input"
                    type="time"
                    step="60"
                    value={form.time}
                    onChange={e=>setForm({...form,time:e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <p className="row-title">Location</p>
                  <input className="input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
                </div>
                <div>
                  <p className="row-title">Type</p>
                  <input className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} />
                </div>
              </div>
              <div>
                <p className="row-title">Capacity</p>
                <input className="input" type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value||'0',10)})} />
              </div>
              <div className="btn-row" style={{justifyContent:'flex-end'}}>
                <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn" onClick={()=>{ addEvent({ ...form, status:'published' }); setShowModal(false); }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events


