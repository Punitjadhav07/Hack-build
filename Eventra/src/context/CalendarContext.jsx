import { createContext, useContext, useState, useEffect } from 'react'
import { getStore, addEvent as addStoreEvent, updateEvent as updateStoreEvent, deleteEvent as deleteStoreEvent } from '../admin/dashboard/store'

const CalendarContext = createContext()

export function CalendarProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Load events from store on mount
  useEffect(() => {
    const store = getStore()
    setEvents(store.events || [])
    setLoading(false)
  }, [])

  // Listen for store changes
  useEffect(() => {
    const handleStorageChange = () => {
      const store = getStore()
      setEvents(store.events || [])
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Add new event
  const addEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date,
      time: eventData.time || '09:00',
      location: eventData.location || 'TBD',
      status: eventData.status || 'draft',
      type: eventData.type || 'general',
      capacity: eventData.capacity || 50,
      registered: 0,
      department: eventData.department || 'General',
      ...eventData
    }

    addStoreEvent(newEvent)
    // Don't manually update local state - let the storage listener handle it
    return newEvent
  }

  // Update existing event
  const updateEvent = (eventId, updates) => {
    updateStoreEvent({ id: eventId, ...updates })
    // Don't manually update local state - let the storage listener handle it
  }

  // Delete event
  const deleteEvent = (eventId) => {
    deleteStoreEvent(eventId)
    // Don't manually update local state - let the storage listener handle it
  }

  // Toggle event status
  const toggleStatus = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const statusOrder = ['draft', 'live', 'completed']
    const currentIndex = statusOrder.indexOf(event.status)
    const nextIndex = (currentIndex + 1) % statusOrder.length
    const newStatus = statusOrder[nextIndex]

    updateEvent(eventId, { status: newStatus })
  }

  // Get events for specific user (registered events)
  const getUserEvents = (userId) => {
    const store = getStore()
    const registrations = store.registrations || []
    const userEventIds = new Set(
      registrations
        .filter(r => r.userId === userId)
        .map(r => r.eventId)
    )
    return events.filter(event => userEventIds.has(event.id))
  }

  // Get events by status
  const getEventsByStatus = (status) => {
    return events.filter(event => event.status === status)
  }

  // Get events by date range
  const getEventsByDateRange = (startDate, endDate) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleStatus,
    getUserEvents,
    getEventsByStatus,
    getEventsByDateRange
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}
