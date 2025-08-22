import { useState } from 'react'
import { getStore, deleteEvent, updateEvent, addEvent } from '../store'
import EventCards from '../../../components/dashboard/EventCards'

function Events() {
  const store = getStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', type: 'general', capacity: 50
  })
  const events = store.events.map(e => ({
    id: e.id,
    status: e.status,
    type: e.type || 'general',
    title: e.title,
    description: e.description || '',
    date: e.date,
    time: e.time,
    location: e.location,
    availableSpots: Math.max(0, (e.capacity || 0) - (e.registered || 0)),
  }))

  function handleRegister(ev) {
    // repurpose as quick publish
    updateEvent({ id: ev.id, status: 'published' })
    window.dispatchEvent(new Event('storage'))
  }

  function handleFeedback(ev) {
    // repurpose as quick delete for demo
    deleteEvent(ev.id)
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="stack-lg">
      <div className="header-row">
        <h2 className="title">Event Management</h2>
        <button className="primary" onClick={() => setShowModal(true)}>+ Create Event</button>
      </div>
      <EventCards events={events} onRegister={handleRegister} onFeedback={handleFeedback} />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-h">
              <h3 className="panel-t">Create New Event</h3>
              <p className="panel-d">Fill the details below</p>
            </div>
            <div className="list form-grid">
              <div>
                <p className="row-title">Title</p>
                <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              </div>
              <div>
                <p className="row-title">Description</p>
                <textarea className="input" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
              <div className="form-row">
                <div>
                  <p className="row-title">Date</p>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={e=>setForm({...form,date:e.target.value})}
                  />
                </div>
                <div>
                  <p className="row-title">Time</p>
                  <input
                    className="input"
                    type="time"
                    step="60"
                    value={form.time}
                    onChange={e=>setForm({...form,time:e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <p className="row-title">Location</p>
                  <input className="input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
                </div>
                <div>
                  <p className="row-title">Type</p>
                  <input className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} />
                </div>
              </div>
              <div>
                <p className="row-title">Capacity</p>
                <input className="input" type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value||'0',10)})} />
              </div>
              <div className="btn-row" style={{justifyContent:'flex-end'}}>
                <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn" onClick={()=>{ addEvent({ ...form, status:'published' }); setShowModal(false); }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events


