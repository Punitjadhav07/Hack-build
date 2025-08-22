function UpcomingEvents({ items }) {
  return (
    <div className="panel">
      <div className="panel-h">
        <h3 className="panel-t">Upcoming Events</h3>
        <p className="panel-d">Your next scheduled events</p>
      </div>
      <div className="list">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="list-row">
              <span className={`dot ${item.statusColor || 'dot-green'}`} />
              <div className="flex-1">
                <p className="row-title">{item.title}</p>
                <p className="row-sub">{item.date}</p>
              </div>
              <span className="chev">›</span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No upcoming events</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingEvents


