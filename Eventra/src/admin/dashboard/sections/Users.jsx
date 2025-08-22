import { useEffect, useState } from 'react'
import { getStore, banUser, unbanUser, reportUser, importUsersFromAuth, getUserById } from '../store'

function Users() {
  useEffect(() => { importUsersFromAuth() }, [])
  const { users, reports } = getStore()
  
  const hasUsers = Array.isArray(users) && users.length > 0
  return (
    <div className="stack-lg">
      <div className="header-row">
        <h2 className="title">User Management</h2>
        
      </div>
      <div className="panel">
        <div className="panel-h">
          <h3 className="panel-t">Directory</h3>
          <p className="panel-d">Manage users and roles</p>
        </div>
        <div className="list">
          {!hasUsers ? (
            <div className="empty-state"><p>No users yet</p></div>
          ) : users.map(u => (
            <div key={u.id} className="list-row">
              <div className="avatar" style={{height:28,width:28}}>{(u.name||'U').split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
              <div className="flex-1">
                <p className="row-title">{u.name}</p>
                <p className="row-sub">{u.email}</p>
              </div>
              <span className="pill pill-muted" style={{marginRight:8}}>{u.role}</span>
              <span className="pill" style={{marginRight:8}}>{u.status || 'active'}</span>
              <button className="btn btn-outline" onClick={() => { const r = prompt('Reason for report?'); reportUser(u.id, r); }}>Report</button>
              {u.status === 'banned' ? (
                <button className="btn" onClick={() => { unbanUser(u.id) }}>Unban</button>
              ) : (
                <button className="btn" onClick={() => { banUser(u.id) }}>Ban</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <h3 className="panel-t">Reports</h3>
          <p className="panel-d">Recent user reports</p>
        </div>
        <div className="list">
          {(!reports || reports.length === 0) ? (
            <div className="empty-state"><p>No reports</p></div>
          ) : reports.map(r => (
            <div key={r.id} className="note-row">
              <span className="bullet bullet-red" />
              <div className="flex-1">
                <p className="row-title">{getUserById(r.userId)?.name || ('User ' + r.userId)} • {r.time}</p>
                <p className="row-sub">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  )
}

export default Users


