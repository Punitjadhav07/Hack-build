# Admin Dashboard

Placeholder for admin dashboard implementation. This directory will contain:

- data adapters to fetch and normalize admin-specific data
- admin UI components (mirroring user dashboard components where possible)
- page entry `AdminDashboard.jsx` once UI is provided

Interfaces expected by the user dashboard components:

- stats: [{ label: string, value: number, color: 'stat-blue'|'stat-green'|'stat-orange'|'stat-red' }]
- upcomingEvents: [{ id: string|number, title: string, date: string, statusColor?: string }]
- notifications: [{ id: string|number, message: string, time: string, unread?: boolean }]
- events: [{ id, status, type, title, description, date, time, location, availableSpots? }]


