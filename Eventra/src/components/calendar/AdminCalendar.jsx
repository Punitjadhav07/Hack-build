import { useState, useMemo } from 'react'
import { useCalendar } from '../../context/CalendarContext'
import './calendar.css'

function AdminCalendar() {
  const { events, addEvent, updateEvent, deleteEvent, toggleStatus, loading } = useCalendar()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedEvents, setSelectedEvents] = useState(new Set())
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    location: '',
    type: 'general',
    capacity: 50
  })

  // Get current month's events
  const currentMonthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events, selectedMonth, selectedYear])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [selectedMonth, selectedYear])

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return currentMonthEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Navigate months
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingEvent) {
      updateEvent(editingEvent.id, formData)
      setEditingEvent(null)
    } else {
      addEvent(formData)
    }
    
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '09:00',
      location: '',
      type: 'general',
      capacity: 50
    })
    setShowAddForm(false)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      capacity: event.capacity
    })
    setShowAddForm(true)
  }

  const handleDelete = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This will remove it from the calendar and all event management areas.')) {
      deleteEvent(eventId)
    }
  }

  const handleDeleteEmptyEvents = () => {
    const emptyEvents = events.filter(event => 
      !event.title || 
      event.title.trim() === '' || 
      !event.description || 
      event.description.trim() === '' ||
      event.title === 'Untitled' ||
      event.title === 'New Event'
    )

    if (emptyEvents.length === 0) {
      alert('No empty events found to delete.')
      return
    }

    if (window.confirm(`Found ${emptyEvents.length} empty event(s). Delete all empty events?`)) {
      emptyEvents.forEach(event => {
        deleteEvent(event.id)
      })
      alert(`Deleted ${emptyEvents.length} empty event(s).`)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '09:00',
      location: '',
      type: 'general',
      capacity: 50
    })
  }

  const handleBulkDelete = () => {
    if (selectedEvents.size === 0) {
      alert('Please select events to delete.')
      return
    }

    const eventCount = selectedEvents.size
    if (window.confirm(`Are you sure you want to delete ${eventCount} selected event(s)? This will permanently remove them from the calendar and all event management areas.`)) {
      selectedEvents.forEach(eventId => {
        deleteEvent(eventId)
      })
      setSelectedEvents(new Set())
    }
  }

  const handleSelectEvent = (eventId) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedEvents.size === currentMonthEvents.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(currentMonthEvents.map(event => event.id)))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'live': return 'status-live'
      case 'completed': return 'status-completed'
      default: return 'status-draft'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">Admin Calendar</h2>
        <div className="calendar-actions">
          {selectedEvents.size > 0 && (
            <>
              <button 
                className="btn btn-outline danger" 
                onClick={handleBulkDelete}
              >
                🗑️ Delete Selected ({selectedEvents.size})
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => setSelectedEvents(new Set())}
              >
                Clear Selection
              </button>
            </>
          )}
          <button 
            className="btn btn-outline warning" 
            onClick={handleDeleteEmptyEvents}
            title="Delete all events with no title or description"
          >
            🧹 Clean Empty Events
          </button>
          <button 
            className="btn primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Add Event
          </button>
        </div>
        <div className="calendar-navigation">
          <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
            ← Previous
          </button>
          <span className="calendar-month-year">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button className="calendar-nav-btn" onClick={goToNextMonth}>
            Next →
          </button>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {showAddForm && (
        <div className="calendar-form-overlay">
          <div className="calendar-form">
            <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div>
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div>
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div>
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="general">General</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="career">Career</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-day-header">Sun</div>
        <div className="calendar-day-header">Mon</div>
        <div className="calendar-day-header">Tue</div>
        <div className="calendar-day-header">Wed</div>
        <div className="calendar-day-header">Thu</div>
        <div className="calendar-day-header">Fri</div>
        <div className="calendar-day-header">Sat</div>

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === selectedMonth
          const isToday = date.toDateString() === new Date().toDateString()
          const dayEvents = getEventsForDay(date)
          
          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
            >
              <div className="calendar-day-number">{date.getDate()}</div>
              {dayEvents.length > 0 && (
                <div className="calendar-events">
                  {dayEvents.map(event => (
                    <div key={event.id} className={`calendar-event-item ${getStatusColor(event.status)}`}>
                      <div className="event-title">{event.title}</div>
                      <div className="event-status">{event.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Events list for current month */}
      <div className="calendar-events-list">
        <div className="events-list-header">
          <h3>All Events This Month</h3>
          {currentMonthEvents.length > 0 && (
            <div className="bulk-actions">
              <button 
                className="btn btn-outline small"
                onClick={handleSelectAll}
              >
                {selectedEvents.size === currentMonthEvents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
        {currentMonthEvents.length > 0 ? (
          currentMonthEvents.map(event => {
            const isEmpty = !event.title || 
                           event.title.trim() === '' || 
                           !event.description || 
                           event.description.trim() === '' ||
                           event.title === 'Untitled' ||
                           event.title === 'New Event'
            
            return (
            <div key={event.id} className={`event-list-item admin-event ${isEmpty ? 'empty-event' : ''}`}>
              <div className="event-checkbox">
                <input
                  type="checkbox"
                  checked={selectedEvents.has(event.id)}
                  onChange={() => handleSelectEvent(event.id)}
                />
              </div>
              <div className="event-date">
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="event-details">
                <div className="event-title">
                  {event.title || 'No Title'}
                  {isEmpty && <span className="empty-badge">⚠️ Empty</span>}
                </div>
                <div className="event-location">📍 {event.location || 'No Location'}</div>
                <div className="event-time">⏰ {event.time || 'No Time'}</div>
                <div className={`event-status ${getStatusColor(event.status)}`}>
                  Status: {event.status}
                </div>
                {isEmpty && (
                  <div className="empty-warning">
                    ⚠️ This event has no title or description
                  </div>
                )}
              </div>
              <div className="event-actions">
                <button 
                  className="btn btn-outline small"
                  onClick={() => toggleStatus(event.id)}
                >
                  {event.status === 'draft' ? 'Go Live' : 
                   event.status === 'live' ? 'Complete' : 'Set Draft'}
                </button>
                <button 
                  className="btn btn-outline small"
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-outline small danger"
                  onClick={() => handleDelete(event.id)}
                  title="Delete this event permanently"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )
          })
        ) : (
          <p>No events this month.</p>
        )}
      </div>
    </div>
  )
}

export default AdminCalendar
