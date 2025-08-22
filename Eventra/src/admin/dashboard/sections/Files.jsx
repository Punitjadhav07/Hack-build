import { getStore, updateStore } from '../store'

function Files() {
  const store = getStore()

  function addBadge() {
    const name = prompt('Badge file name')
    if (!name) return
    updateStore(s => { s.files.badges.push({ name, url: '#' }); return s })
    window.dispatchEvent(new Event('storage'))
  }

  function addDoc() {
    const name = prompt('Document file name')
    if (!name) return
    updateStore(s => { s.files.documents.push({ name, url: '#' }); return s })
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="stack-lg">
      <h2 className="title">File Management</h2>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-h">
            <h3 className="panel-t">Event Badges</h3>
            <p className="panel-d">Upload and manage event badges and certificates</p>
          </div>
          <div className="list">
            {store.files.badges.length === 0 ? (
              <div className="empty-state"><p>No badges uploaded</p></div>
            ) : store.files.badges.map((f,i) => (
              <div key={i} className="list-row"><span className="row-title">{f.name}</span></div>
            ))}
            <div style={{textAlign:'right'}}>
              <button className="btn" onClick={addBadge}>Choose Files</button>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h">
            <h3 className="panel-t">Documents</h3>
            <p className="panel-d">Upload presentations, forms, and other documents</p>
          </div>
          <div className="list">
            {store.files.documents.length === 0 ? (
              <div className="empty-state"><p>No documents uploaded</p></div>
            ) : store.files.documents.map((f,i) => (
              <div key={i} className="list-row"><span className="row-title">{f.name}</span></div>
            ))}
            <div style={{textAlign:'right'}}>
              <button className="btn" onClick={addDoc}>Choose Files</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Files


