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
    s.events.push({
      id: Date.now(),
      title: 'Tech Innovation Summit 2024',
      department: 'Computer Science Department',
      date: 'Jan 15, 2024',
      time: '09:00 AM',
      location: 'Main Auditorium',
      status: 'published',
      capacity: 500,
      registered: 0,
      type: 'conference',
      description: 'Annual technology and innovation conference featuring industry leaders.'
    })
    s.stats.totalEvents = 1
    writeStore(s)
  }
}

export function migrateStore() {
  const s = readStore()
  let changed = false
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


