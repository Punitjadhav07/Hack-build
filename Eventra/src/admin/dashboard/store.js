// Simple localStorage-backed store for admin and user dashboards

const STORAGE_KEY = 'eventra_store_v1'

function readStore() {
  const defaults = {
    stats: { totalEvents: 0, totalUsers: 0, registrations: 0, pendingApprovals: 0 },
    events: [],
    approvals: [],
    users: [],
    files: { badges: [], documents: [] },
    notifications: [],
    registrations: [],
    reports: [], // {id, userId, reason, time}
    feedback: [], // {id, eventId, userId, userName, rating, comment, submittedAt}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...defaults,
        ...parsed,
        stats: { ...defaults.stats, ...(parsed?.stats || {}) },
        files: { ...defaults.files, ...(parsed?.files || {}) },
        events: parsed?.events || [],
        approvals: parsed?.approvals || [],
        users: parsed?.users || [],
        notifications: parsed?.notifications || [],
        registrations: parsed?.registrations || [],
        feedback: parsed?.feedback || [],
      }
    }
  } catch {}
  return { ...defaults }
}

function writeStore(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // Notify listeners immediately so UIs refresh without page reload
  try { window.dispatchEvent(new Event('storage')) } catch {}
}

export function getStore() { return readStore() }

export function updateStore(mutator) {
  const current = readStore()
  const next = mutator({ ...current }) || current
  writeStore(next)
  return next
}

export function addEvent(event) {
  return updateStore(s => {
    const id = event.id || Date.now()
    s.events.push({ id, status: 'draft', capacity: 0, registered: 0, ...event })
    s.stats.totalEvents = s.events.length
    return s
  })
}

export function updateEvent(event) {
  return updateStore(s => {
    s.events = s.events.map(e => e.id === event.id ? { ...e, ...event } : e)
    return s
  })
}

export function deleteEvent(id) {
  return updateStore(s => {
    s.events = s.events.filter(e => e.id !== id)
    s.stats.totalEvents = s.events.length
    return s
  })
}

export function queueApproval(item) {
  return updateStore(s => {
    s.approvals.push({ id: item.id || Date.now(), submittedAt: new Date().toISOString(), ...item })
    s.stats.pendingApprovals = s.approvals.length
    return s
  })
}

export function resolveApproval(id, approved) {
  return updateStore(s => {
    const ap = s.approvals.find(a => a.id === id)
    s.approvals = s.approvals.filter(a => a.id !== id)
    s.stats.pendingApprovals = s.approvals.length
    if (approved && ap) {
      s.events.push({
        id: ap.id,
        title: ap.title,
        department: ap.organizer,
        date: ap.date || '',
        time: ap.time || '',
        location: ap.location || '',
        status: 'published',
        capacity: ap.capacity || 0,
        registered: 0
      })
      s.stats.totalEvents = s.events.length
    }
    return s
  })
}

export function addUser(user) {
  return updateStore(s => { s.users.push({ id: user.id || Date.now(), status: 'active', ...user }); s.stats.totalUsers = s.users.length; return s })
}

export function addNotification(n) {
  return updateStore(s => { s.notifications.unshift({ id: Date.now(), time: 'just now', ...n }); return s })
}

export function banUser(userId) {
  return updateStore(s => {
    s.users = (s.users || []).map(u => u.id === userId ? { ...u, status: 'banned' } : u)
    return s
  })
}

export function unbanUser(userId) {
  return updateStore(s => {
    s.users = (s.users || []).map(u => u.id === userId ? { ...u, status: 'active' } : u)
    return s
  })
}

export function reportUser(userId, reason) {
  return updateStore(s => {
    s.reports.unshift({ id: Date.now(), userId, reason: reason || 'Reported by admin', time: new Date().toLocaleString() })
    s.notifications.unshift({ id: Date.now()+1, type: 'Report', message: `User ${userId} reported: ${reason || ''}`, time: 'just now' })
    return s
  })
}

export function importUsersFromAuth() {
  try {
    const raw = localStorage.getItem('users')
    const authUsers = raw ? JSON.parse(raw) : []
    if (!Array.isArray(authUsers) || authUsers.length === 0) return getStore()
    return updateStore(s => {
      const existingByEmail = new Map((s.users || []).map(u => [u.email, u]))
      for (const u of authUsers) {
        if (!existingByEmail.has(u.email)) {
          s.users.push({ id: u.id || Date.now()+Math.random(), name: u.name || u.email, email: u.email, role: u.role || 'user', status: 'active', lastLogin: '', eventsCount: 0 })
        }
      }
      s.stats.totalUsers = s.users.length
      return s
    })
  } catch {
    return getStore()
  }
}

export function getUserById(userId) {
  const s = readStore()
  return (s.users || []).find(u => u.id === userId)
}

export function getRegistrantsForEvent(eventId) {
  const s = readStore()
  const regs = (s.registrations || []).filter(r => r.eventId === eventId)
  const byId = new Map((s.users || []).map(u => [u.id, u]))
  return regs.map(r => byId.get(r.userId)).filter(Boolean)
}

export function registerForEvent(userId, eventId) {
  return updateStore(s => {
    const exists = s.registrations.find(r => r.userId === userId && r.eventId === eventId)
    if (!exists) {
      s.registrations.push({ userId, eventId })
      const ev = s.events.find(e => e.id === eventId)
      if (ev) { ev.registered = (ev.registered || 0) + 1 }
      s.stats.registrations = s.registrations.length
    }
    return s
  })
}

export function getUserEvents(userId) {
  const s = readStore()
  const registrations = Array.isArray(s.registrations) ? s.registrations : []
  const ids = new Set(registrations.filter(r => r.userId === userId).map(r => r.eventId))
  return (s.events || []).filter(e => ids.has(e.id))
}

// Seed a global dummy event for demo
export function seedIfEmpty() {
  const s = readStore()
  if (s.events.length === 0) {
    const techSummitId = Date.now()
    s.events.push({
      id: techSummitId,
      title: 'Tech Innovation Summit 2025',
      department: 'Computer Science Department',
      date: 'Mar 15, 2025',
      time: '09:00 AM',
      location: 'Main Auditorium',
      status: 'published',
      capacity: 500,
      registered: 0,
      type: 'conference',

      description: 'Annual technology and innovation conference featuring industry leaders.'
    })
    
    // Add some attended events for testing feedback
    const workshopId = Date.now() + 1
    s.events.push({
      id: workshopId,
      title: 'Web Development Workshop',
      department: 'Computer Science Department',
      date: 'Feb 20, 2025',
      time: '02:00 PM',
      location: 'Computer Lab 101',
      status: 'published',
      capacity: 30,
      registered: 25,
      type: 'workshop',
      description: 'Hands-on workshop on modern web development technologies.'
    })
    
    // Add sample feedback for testing
    s.feedback.push({
      id: Date.now() + 100,
      eventId: workshopId,
      userId: 'student1@example.com',
      userName: 'John Smith',
      rating: 5,
      comment: 'Excellent workshop! The instructor was very knowledgeable and the hands-on exercises were really helpful. I learned a lot about modern web development.',
      submittedAt: '2025-02-20T16:30:00.000Z'
    })
    
    s.feedback.push({
      id: Date.now() + 101,
      eventId: workshopId,
      userId: 'student2@example.com',
      userName: 'Sarah Johnson',
      rating: 4,
      comment: 'Great workshop overall. The content was well-structured and practical. Would have liked more time for the advanced topics.',
      submittedAt: '2025-02-20T17:15:00.000Z'
    })
    
    // Add feedback to Tech Innovation Summit 2024
    s.feedback.push({
      id: Date.now() + 200,
      eventId: techSummitId,
      userId: 'alex@example.com',
      userName: 'Alex Chen',
      rating: 5,
      comment: 'Outstanding conference! The keynote speakers were industry leaders and the networking opportunities were incredible. Highly recommend for anyone in tech.',
      submittedAt: '2025-03-15T18:30:00.000Z'
    })
    
    s.feedback.push({
      id: Date.now() + 201,
      eventId: techSummitId,
      userId: 'maria@example.com',
      userName: 'Maria Rodriguez',
      rating: 4,
      comment: 'Great insights into the latest tech trends. The panel discussions were engaging and I learned a lot about AI and machine learning applications.',
      submittedAt: '2025-03-15T19:15:00.000Z'
    })
    
    // Add third event
    s.events.push({
      id: Date.now() + 2,
      title: 'UI/UX Design Workshop',
      department: 'Design Department',
      date: 'Apr 10, 2025', 
      time: '10:00 AM',
      location: 'Design Lab',
      status: 'published',
      capacity: 40,
      registered: 15,
      type: 'workshop',
      description: 'Learn the fundamentals of user interface and user experience design.'
    })

    // Add sample notifications
    s.notifications.push({
      id: Date.now() + 300,
      title: 'Welcome to Eventra!',
      message: 'Your account has been successfully created. Start exploring events and register for exciting activities.',
      type: 'success',
      unread: true,
      timestamp: new Date().toISOString(),
      category: 'System'
    })
    
    s.notifications.push({
      id: Date.now() + 301,
      title: 'New Event Available',
      message: 'Tech Innovation Summit 2025 is now open for registration. Don\'t miss this amazing opportunity!',
      type: 'event',
      unread: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      category: 'Events'
    })
    
    s.notifications.push({
      id: Date.now() + 302,
      title: 'Event Reminder',
      message: 'Your registered event "Web Development Workshop" starts in 2 hours. Don\'t forget to bring your laptop!',
      type: 'reminder',
      unread: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      category: 'Reminders'
    })
    
    s.notifications.push({
      id: Date.now() + 303,
      title: 'System Update',
      message: 'We\'ve added new features to improve your experience. Check out the updated calendar and notification system.',
      type: 'update',
      unread: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      category: 'Updates'
    })
    
    s.stats.totalEvents = 2
    writeStore(s)
  }
}

export function migrateStore() {
  const s = readStore()
  let changed = false
  
  // Remove Career Fair 2023 if it exists (cleanup)
  const careerFairIndex = s.events.findIndex(e => e.title === 'Career Fair 2023')
  if (careerFairIndex !== -1) {
    const careerFairId = s.events[careerFairIndex].id
    s.events.splice(careerFairIndex, 1)
    s.feedback = s.feedback.filter(f => f.eventId !== careerFairId)
    changed = true
  }
  
  // Add ticket prices to existing events if they don't have them
  s.events = (s.events || []).map(e => {
    const next = {
      type: 'general',
      description: e.description || 'No description provided',
      date: e.date || 'TBD',
      time: e.time || 'TBD',
      location: e.location || 'TBD',
      capacity: (e.capacity ?? 50),
      registered: (e.registered ?? 0),

      ...e,
    }
    if (next !== e) changed = true
    return next
  })
  

  
  if (changed) writeStore(s)
}

// Add sample attended events and feedback for testing
export function addSampleFeedbackData() {
  const s = readStore()
  let added = false
  
  // Remove Career Fair 2023 if it exists
  const careerFairIndex = s.events.findIndex(e => e.title === 'Career Fair 2023')
  if (careerFairIndex !== -1) {
    const careerFairId = s.events[careerFairIndex].id
    // Remove the event
    s.events.splice(careerFairIndex, 1)
    // Remove any feedback for this event
    s.feedback = s.feedback.filter(f => f.eventId !== careerFairId)
    added = true
  }
  
  // Check if we already have the sample attended events
  const hasWorkshop = s.events.some(e => e.title === 'Web Development Workshop' && e.status === 'attended')
  
  if (!hasWorkshop) {
    const workshopId = Date.now() + 1000
    s.events.push({
      id: workshopId,
      title: 'Web Development Workshop',
      department: 'Computer Science Department',
      date: 'Feb 20, 2025',
      time: '02:00 PM',
      location: 'Computer Lab 101',
      status: 'attended',
      capacity: 30,
      registered: 25,
      type: 'workshop',
      description: 'Hands-on workshop on modern web development technologies.'
    })
    
    // Add sample feedback for workshop
    s.feedback.push({
      id: Date.now() + 2000,
      eventId: workshopId,
      userId: 'student1@example.com',
      userName: 'John Smith',
      rating: 5,
      comment: 'Excellent workshop! The instructor was very knowledgeable and the hands-on exercises were really helpful. I learned a lot about modern web development.',
      submittedAt: '2025-02-20T16:30:00.000Z'
    })
    
    s.feedback.push({
      id: Date.now() + 2001,
      eventId: workshopId,
      userId: 'student2@example.com',
      userName: 'Sarah Johnson',
      rating: 4,
      comment: 'Great workshop overall. The content was well-structured and practical. Would have liked more time for the advanced topics.',
      submittedAt: '2025-02-20T17:15:00.000Z'
    })
    
    added = true
  }
  
  // Add feedback to Tech Innovation Summit 2025 if it exists
  const techSummit = s.events.find(e => e.title === 'Tech Innovation Summit 2025')
  if (techSummit && !s.feedback.some(f => f.eventId === techSummit.id)) {
    s.feedback.push({
      id: Date.now() + 3000,
      eventId: techSummit.id,
      userId: 'alex@example.com',
      userName: 'Alex Chen',
      rating: 5,
      comment: 'Outstanding conference! The keynote speakers were industry leaders and the networking opportunities were incredible. Highly recommend for anyone in tech.',
      submittedAt: '2025-03-15T18:30:00.000Z'
    })
    
    s.feedback.push({
      id: Date.now() + 3001,
      eventId: techSummit.id,
      userId: 'maria@example.com',
      userName: 'Maria Rodriguez',
      rating: 4,
      comment: 'Great insights into the latest tech trends. The panel discussions were engaging and I learned a lot about AI and machine learning applications.',
      submittedAt: '2025-03-15T19:15:00.000Z'
    })
    
    added = true
  }
  
  if (added) {
    s.stats.totalEvents = s.events.length
    writeStore(s)
  }
  
  return s
}



export function addFeedback(feedback) {
  return updateStore(s => {
    const id = feedback.id || Date.now()
    s.feedback.push({ 
      id, 
      submittedAt: new Date().toISOString(),
      ...feedback 
    })
    return s
  })
}

export function getFeedbackForEvent(eventId) {
  const s = readStore()
  return (s.feedback || []).filter(f => f.eventId === eventId)
}

export function getUserFeedback(userId) {
  const s = readStore()
  return (s.feedback || []).filter(f => f.userId === userId)
}


