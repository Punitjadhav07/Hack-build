function EventCard({ event, onRegister, onFeedback, onSelect }) {
  return (
    <div className="card" onClick={() => onSelect?.(event)}>
      <div className="card-h">
        <span className="pill pill-outline">{event.type}</span>
        <span className={`pill ${event.status==='registered' ? '' : 'pill-muted'}`}>{event.status}</span>
      </div>
      <h4 className="card-title">{event.title}</h4>
      <p className="card-desc">{event.description}</p>
      <div className="meta">
        <div className="meta-row">📅 {event.date}</div>
        <div className="meta-row">⏰ {event.time}</div>
        <div className="meta-row">📍 {event.location}</div>
      </div>
      <div className="btn-row">
        {event.status === 'registered' ? (
          <>
            <button className="btn btn-outline" onClick={() => alert('Ticket viewer not implemented')}>🧾 View Ticket</button>
            <button className="btn btn-outline" onClick={() => onFeedback?.(event)}>⭐ Feedback</button>
          </>
        ) : (
          <button className="btn primary wide" onClick={(e) => { e.stopPropagation(); onRegister?.(event) }}>Register ({event.availableSpots} spots left)</button>
        )}
        <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); onSelect?.(event) }}>Details</button>
      </div>
    </div>
  )
}

function EventCards({ events, onRegister, onFeedback, onSelect }) {
  return (
    <div className="cards-3">
      {events && events.length > 0 ? (
        events.map((event) => (
          <EventCard key={event.id} event={event} onRegister={onRegister} onFeedback={onFeedback} onSelect={onSelect} />
        ))
      ) : (
        <div className="empty-state-wide">
          <p>No events found</p>
          <p>Register for events to see them here</p>
        </div>
      )}
    </div>
  )
}

export default EventCards


