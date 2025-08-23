import { useState, useMemo } from 'react'
import { useCalendar } from '../../context/CalendarContext'
import './calendar.css'

function UserCalendar({ currentUser }) {
  const { getUserEvents, loading } = useCalendar()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Get user's registered events
  const userEvents = useMemo(() => {
    if (!currentUser) return []
    return getUserEvents(currentUser.id || currentUser.email)
  }, [currentUser, getUserEvents])

  // Get current month's events
  const currentMonthEvents = useMemo(() => {
    return userEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [userEvents, selectedMonth, selectedYear])

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
        <h2 className="calendar-title">My Events Calendar</h2>
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
                    <div key={event.id} className="calendar-event-item">
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{event.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Events list for current month */}
      {currentMonthEvents.length > 0 && (
        <div className="calendar-events-list">
          <h3>Events This Month</h3>
          {currentMonthEvents.map(event => (
            <div key={event.id} className="event-list-item">
              <div className="event-date">
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-location">📍 {event.location}</div>
                <div className="event-time">⏰ {event.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {userEvents.length === 0 && (
        <div className="calendar-empty">
          <p>No events registered yet.</p>
          <p>Register for events to see them in your calendar.</p>
        </div>
      )}
    </div>
  )
}

export default UserCalendar



