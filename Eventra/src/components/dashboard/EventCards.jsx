import { useState } from 'react'
import FeedbackForm from './FeedbackForm'
import FeedbackDisplay from './FeedbackDisplay'
import TicketViewer from './TicketViewer'

function EventCard({ event, onRegister, onFeedback, onSelect, onHide, onDelete, feedback = [], isAdmin = false, currentUser = null }) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showTicketViewer, setShowTicketViewer] = useState(false)
  const [ticketReady, setTicketReady] = useState(false)

  const handleFeedbackSubmit = (feedbackData) => {
    if (onFeedback) {
      onFeedback(event, feedbackData)
    }
    setShowFeedbackForm(false)
    setShowFeedback(true)
  }

  const handleViewTicket = async () => {
    setShowTicketViewer(true)
    setTicketReady(false)
    // Small delay to ensure modal renders first
    setTimeout(() => {
      setTicketReady(true)
    }, 100)
  }

  const canGiveFeedback = event.status === 'attended' || event.status === 'registered'
  const hasFeedback = feedback && feedback.length > 0

  return (
    <div className="card">
      <div className="card-content" onClick={() => onSelect?.(event)}>
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
          {event.ticketPrice !== undefined && (
            <div className="meta-row">
              💰 {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}
            </div>
          )}
        </div>
        
        {/* Hide button for ended events (admin only) */}
        {isAdmin && event.status === 'attended' && (
          <div className="event-hide-section">
            <button className="btn btn-outline event-hide-btn" onClick={(e) => { e.stopPropagation(); onHide?.(event) }}>
              🙈 Hide This Ended Event
            </button>
          </div>
        )}
        
        <div className="btn-row">
          {event.status === 'registered' ? (
            <>
              <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleViewTicket() }}>🧾 View Ticket</button>
              {canGiveFeedback && !isAdmin && (
                <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); setShowFeedbackForm(true) }}>⭐ Give Feedback</button>
              )}
            </>
          ) : event.status === 'attended' ? (
            <>
              {canGiveFeedback && !isAdmin && (
                <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); setShowFeedbackForm(true) }}>⭐ Give Feedback</button>
              )}
              {hasFeedback && (
                <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); setShowFeedback(!showFeedback) }}>
                  {showFeedback ? 'Hide' : 'View'} Feedback ({feedback.length})
                </button>
              )}
              {isAdmin && (
                <>
                  <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); onRegister?.(event) }}>
                    🔄 Make Live Again
                  </button>
                  <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); onDelete?.(event) }}>
                    🗑️ Delete Event
                  </button>
                </>
              )}
            </>
          ) : event.status === 'published' ? (
            <>
              {isAdmin ? (
                <>
                  <button className="btn primary" onClick={(e) => { e.stopPropagation(); onRegister?.(event) }}>
                    🔄 End Event
                  </button>
                  <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); onDelete?.(event) }}>
                    🗑️ Delete Event
                  </button>
                </>
              ) : (
                <button 
                  className="btn primary wide" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onRegister?.(event);
                  }}
                >
                  Register ({event.availableSpots} spots left)
                </button>
              )}
            </>
          ) : (
            <button className="btn primary wide" onClick={(e) => { e.stopPropagation(); onRegister?.(event) }}>Register ({event.availableSpots} spots left)</button>
          )}
          {!isAdmin && (
            <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); onSelect?.(event) }}>Details</button>
          )}
        </div>
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="card-feedback-form">
          <FeedbackForm 
            event={event}
            onSubmit={handleFeedbackSubmit}
            onCancel={() => setShowFeedbackForm(false)}
          />
        </div>
      )}

      {/* Feedback Display */}
      {showFeedback && hasFeedback && (
        <div className="card-feedback-display">
          <FeedbackDisplay feedback={feedback} isAdmin={isAdmin} />
        </div>
      )}

      {/* Ticket Viewer */}
      {showTicketViewer && ticketReady && (
        <TicketViewer 
          event={event} 
          currentUser={currentUser} 
          onClose={() => setShowTicketViewer(false)} 
        />
      )}


    </div>
  )
}

function EventCards({ events, onRegister, onFeedback, onSelect, onHide, onDelete, feedbackByEvent = {}, isAdmin = false, currentUser = null }) {
  return (
    <div className="cards-3">
      {events && events.length > 0 ? (
        events.map((event) => (
                     <EventCard 
             key={event.id} 
             event={event} 
             onRegister={onRegister} 
             onFeedback={onFeedback} 
             onSelect={onSelect}
             onHide={onHide}
             onDelete={onDelete}
             feedback={feedbackByEvent[event.id] || []}
             isAdmin={isAdmin}
             currentUser={currentUser}
           />
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


