import { useState } from 'react'
import './login.css'

function Login({ onNavigateToSignup, onLoginSuccess }) {
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    // Admin authentication
    if (role === 'admin') {
      if (email === 'admin@admin.com' && password === 'admin@123') {
        const adminUser = {
          id: 'admin',
          name: 'Administrator',
          email: 'admin@admin.com',
          role: 'admin'
        }
        localStorage.setItem('currentUser', JSON.stringify(adminUser))
        onLoginSuccess?.(adminUser)
        return
      } else {
        setError('Invalid admin credentials')
        return
      }
    }

    // User authentication
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === email && u.role === 'user')
    
    if (!user) {
      setError('User not found. Please sign up first.')
      return
    }

    if (user.password !== password) {
      setError('Invalid password')
      return
    }

    // Store current user
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    onLoginSuccess?.(currentUser)
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Eventra</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <div className="role-toggle" role="tablist" aria-label="Choose role">
          <button
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
            type="button"
            aria-selected={role === 'user'}
          >
            <span className="role-icon" aria-hidden>👤</span>
            <span>User</span>
          </button>
          <button
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
            type="button"
            aria-selected={role === 'admin'}
          >
            <span className="role-icon" aria-hidden>🗂️</span>
            <span>Admin</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              placeholder="your.email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

        	<label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="submit" type="submit">Sign In</button>
        </form>

        <div className="login-footer">
          <a className="link" href="#forgot">Forgot your password?</a>
          <div className="divider" />
          <p className="signup">Don't have an account? <a className="link" href="#signup" onClick={onNavigateToSignup}>Sign up</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login


