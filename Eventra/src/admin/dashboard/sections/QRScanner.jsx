import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { getStore, getUserEvents } from '../store'

function QRScanner() {
  const [scannedResult, setScannedResult] = useState(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [store] = useState(getStore())

  // QR Scanner functionality
  useEffect(() => {
    if (!scannerActive) return

    const scanner = new Html5QrcodeScanner(
      "admin-qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render((decodedText) => {
      try {
        const data = JSON.parse(decodedText)
        if (data.type === 'eventra-ticket') {
          // Check if user is registered for this event
          const userEvents = getUserEvents(data.userId)
          const isRegistered = userEvents.some(e => e.id === data.eventId)
          
          if (isRegistered) {
            setScannedResult({
              valid: true,
              message: `Valid user: ${data.userName} (ID: ${data.userId})`,
              eventTitle: data.eventTitle,
              eventDetails: userEvents.find(e => e.id === data.eventId)
            })
          } else {
            setScannedResult({
              valid: false,
              message: `Invalid ticket: User not registered for this event`,
              eventTitle: data.eventTitle,
              userId: data.userId,
              userName: data.userName
            })
          }
        } else {
          setScannedResult({
            valid: false,
            message: 'Invalid QR code format',
            eventTitle: 'Unknown'
          })
        }
        setScannerActive(false)
        scanner.clear()
      } catch (err) {
        setScannedResult({
          valid: false,
          message: 'Invalid QR code data',
          eventTitle: 'Unknown'
        })
        setScannerActive(false)
        scanner.clear()
      }
    }, (error) => {
      console.error('QR scan error:', error)
    })

    return () => {
      scanner.clear()
    }
  }, [scannerActive])

  const startScanner = () => {
    setScannedResult(null)
    setScannerActive(true)
  }

  const stopScanner = () => {
    setScannerActive(false)
    setScannedResult(null)
  }

  const clearResult = () => {
    setScannedResult(null)
  }

  return (
    <div className="stack-lg">
      <div className="header-row">
        <h2 className="title">QR Code Scanner</h2>
        <p className="panel-d">Scan user QR codes to validate event tickets</p>
      </div>

      {/* Scanner Controls */}
      <div className="panel">
        <div className="panel-h">
          <h3 className="panel-t">Scanner Controls</h3>
          <p className="panel-d">Use this scanner to validate user tickets at event entry</p>
        </div>
        <div className="list">
          <div className="list-row">
            <div className="flex-1">
              <p className="row-title">Camera Scanner</p>
              <p className="row-sub">Click start to activate camera for QR code scanning</p>
            </div>
            <div className="flex gap-2">
              <button 
                className={`btn ${scannerActive ? 'btn-danger' : 'btn-primary'}`}
                onClick={scannerActive ? stopScanner : startScanner}
              >
                {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
              </button>
              {scannedResult && (
                <button className="btn btn-outline" onClick={clearResult}>
                  Clear Result
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      {scannerActive && (
        <div className="panel">
          <div className="panel-h">
            <h3 className="panel-t">Camera Scanner</h3>
            <p className="panel-d">Point camera at a user's QR code to validate their ticket</p>
          </div>
          <div id="admin-qr-reader" style={{width: '100%', maxWidth: '500px', margin: '0 auto'}}></div>
        </div>
      )}

      {/* Scan Result */}
      {scannedResult && (
        <div className={`panel ${scannedResult.valid ? 'valid-ticket' : 'invalid-ticket'}`}>
          <div className="panel-h">
            <h3 className="panel-t">Scan Result</h3>
            <p className="panel-d">Event: {scannedResult.eventTitle}</p>
          </div>
          <div className="list">
            <div className="list-row">
              <div className="flex-1">
                <p className={`row-title ${scannedResult.valid ? 'text-success' : 'text-danger'}`}>
                  {scannedResult.valid ? '✓ VALID TICKET' : '✗ INVALID TICKET'}
                </p>
                <p className="row-sub">{scannedResult.message}</p>
                {scannedResult.valid && scannedResult.eventDetails && (
                  <p className="row-sub" style={{marginTop: '8px'}}>
                    Event: {scannedResult.eventDetails.date} • {scannedResult.eventDetails.time} • {scannedResult.eventDetails.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="panel">
        <div className="panel-h">
          <h3 className="panel-t">How to Use</h3>
          <p className="panel-d">Step-by-step guide for ticket validation</p>
        </div>
        <div className="list">
          <div className="list-row">
            <div className="flex-1">
              <p className="row-title">1. Start Scanner</p>
              <p className="row-sub">Click "Start Scanner" to activate your device's camera</p>
            </div>
          </div>
          <div className="list-row">
            <div className="flex-1">
              <p className="row-title">2. Scan QR Code</p>
              <p className="row-sub">Point the camera at a user's QR code ticket</p>
            </div>
          </div>
          <div className="list-row">
            <div className="flex-1">
              <p className="row-title">3. View Result</p>
              <p className="row-sub">The system will automatically validate the ticket and show the result</p>
            </div>
          </div>
          <div className="list-row">
            <div className="flex-1">
              <p className="row-title">4. Clear & Repeat</p>
              <p className="row-sub">Click "Clear Result" and scan the next ticket</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
