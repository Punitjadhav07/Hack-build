import { getStore, resolveApproval } from '../store'

function Approvals() {
  const { approvals } = getStore()
  return (
    <div className="stack-lg">
      <h2 className="title">Pending Approvals</h2>
      <div className="panel">
        <div className="panel-h">
          <h3 className="panel-t">Event Approval Queue</h3>
          <p className="panel-d">Approve or reject event submissions</p>
        </div>
        <div className="list">
          {approvals.length === 0 ? (
            <div className="empty-state"><p>No pending approvals</p></div>
          ) : approvals.map(item => (
            <div key={item.id} className="list-row">
              <div className="flex-1">
                <p className="row-title">{item.title}</p>
                <p className="row-sub">Submitted by {item.organizer}</p>
              </div>
              <div className="btn-row">
                <button className="btn" onClick={() => { resolveApproval(item.id, true); window.dispatchEvent(new Event('storage')) }}>Approve</button>
                <button className="btn btn-outline" onClick={() => { resolveApproval(item.id, false); window.dispatchEvent(new Event('storage')) }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Approvals


