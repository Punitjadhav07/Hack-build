import { addNotification, getStore } from '../store'

function NotificationsCenter() {
  const store = getStore()
  function send() {
    const message = prompt('Notification message')
    if (!message) return
    addNotification({ type: 'Announcement', message, recipients: 'All users' })
    window.dispatchEvent(new Event('storage'))
  }
  return (
    <div className="stack-lg">
      <div className="header-row">
        <h2 className="title">Notification Center</h2>
        <button className="primary" onClick={send}>Send Notification</button>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-h">
            <h3 className="panel-t">Quick Send</h3>
            <p className="panel-d">Send notifications to users or attendees</p>
          </div>
          <div className="list"><div className="empty-state"><p>Use the button above to send</p></div></div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h3 className="panel-t">Recent Notifications</h3>
            <p className="panel-d">Previously sent notifications</p>
          </div>
          <div className="list">
            {store.notifications.length === 0 ? (
              <div className="empty-state"><p>No notifications yet</p></div>
            ) : store.notifications.map(n => (
              <div key={n.id} className="note-row">
                <span className="bullet bullet-blue" />
                <div className="flex-1">
                  <p className="row-title">{n.message}</p>
                  <p className="row-sub">{n.time} • Sent to {n.recipients || 'users'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCenter


