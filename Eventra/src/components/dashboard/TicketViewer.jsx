import { useState, useEffect, useCallback, useMemo } from 'react'
import QRCode from 'qrcode'
import './ticket-viewer.css'

function TicketViewer({ event, currentUser, onClose }) {
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generated, setGenerated] = useState(false)

  // Memoize ticket data to prevent unnecessary re-renders
  const ticketData = useMemo(() => {
    if (!event || !currentUser) return null
    return {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      userId: currentUser.id || currentUser.email,
      userName: currentUser.name,
      ticketType: 'Digital Ticket',
      issuedAt: new Date().toISOString()
    }
  }, [event?.id, event?.title, event?.date, event?.time, event?.location, currentUser?.id, currentUser?.email, currentUser?.name])

  const generateQRCode = useCallback(async () => {
    if (!ticketData || generated) return
    
    try {
      setLoading(true)
      const qrData = JSON.stringify(ticketData)
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCode(qrCodeDataUrl)
      setGenerated(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }, [ticketData, generated])

  useEffect(() => {
    if (ticketData && !generated) {
      const timer = setTimeout(() => {
        generateQRCode()
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [ticketData, generated, generateQRCode])

  // Memoize the QR code image to prevent re-renders
  const qrCodeImage = useMemo(() => {
    if (!qrCode) return null
    return (
      <img 
        key={`qr-${event?.id}-${currentUser?.id}`}
        src={qrCode} 
        alt="Event QR Code" 
        className="ticket-qr-code" 
      />
    )
  }, [qrCode, event?.id, currentUser?.id])

  if (!event || !currentUser) {
    return null
  }

  return (
    <div className="ticket-content">
      <div className="ticket-header">
        <h3>Digital Ticket</h3>
        <button className="ticket-close" onClick={onClose}>×</button>
      </div>
      
      <div className="ticket-body">
        <div className="ticket-event-info">
          <h2>{event.title}</h2>
          <div className="ticket-meta">
            <div className="ticket-meta-item">
              <span className="ticket-icon">📅</span>
              <span>{event.date}</span>
            </div>
            <div className="ticket-meta-item">
              <span className="ticket-icon">⏰</span>
              <span>{event.time}</span>
            </div>
            <div className="ticket-meta-item">
              <span className="ticket-icon">📍</span>
              <span>{event.location}</span>
            </div>
            <div className="ticket-meta-item">
              <span className="ticket-icon">🎫</span>
              <span>Event Type: {event.type || 'General'}</span>
            </div>
          </div>
        </div>

        <div className="ticket-qr-section">
          <h4>QR Code</h4>
          <div className="ticket-qr-container">
            {loading ? (
              <div className="ticket-qr-loading">
                <div className="loading-spinner"></div>
                <span>Generating QR Code...</span>
              </div>
            ) : qrCodeImage ? (
              qrCodeImage
            ) : (
              <div className="ticket-qr-error">Failed to generate QR code</div>
            )}
          </div>
        </div>

        <div className="ticket-holder-info">
          <h4>Ticket Holder</h4>
          <div className="ticket-holder-details">
            <div className="ticket-holder-item">
              <span className="ticket-label">Name:</span>
              <span className="ticket-value">{currentUser.name}</span>
            </div>
            <div className="ticket-holder-item">
              <span className="ticket-label">ID:</span>
              <span className="ticket-value">{currentUser.id || currentUser.email}</span>
            </div>
            <div className="ticket-holder-item">
              <span className="ticket-label">Ticket Status:</span>
              <span className="ticket-status">✅ Valid</span>
            </div>
          </div>
        </div>

        <div className="ticket-instructions">
          <h4>Instructions</h4>
          <ul>
            <li>Present this QR code at the event entrance</li>
            <li>Keep your ticket safe and accessible</li>
            <li>This ticket is valid for one-time use only</li>
            <li>Arrive 15 minutes before the event starts</li>
          </ul>
        </div>
      </div>

      <div className="ticket-footer">
        <button className="btn btn-outline" onClick={onClose}>Close</button>
        <button className="btn primary" onClick={() => window.print()}>Print Ticket</button>
      </div>
    </div>
  )
}

export default TicketViewer
