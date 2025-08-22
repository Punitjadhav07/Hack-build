function Notifications({ items }) {
  return (
    <div className="panel">
      <div className="panel-h">
        <h3 className="panel-t">Recent Notifications</h3>
        <p className="panel-d">Latest updates and reminders</p>
      </div>
      <div className="list">
        {items && items.length > 0 ? (
          items.map((n) => (
            <div key={n.id} className="note-row">
              <span className={`bullet ${n.unread ? 'bullet-blue' : 'bullet-gray'}`} />
              <div className="flex-1">
                <p className="row-title">{n.message}</p>
                <p className="row-sub">{n.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications


