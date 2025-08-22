import { useState } from 'react'
import './signup.css'

function Signup({ onNavigateToLogin }) {
  const [role] = useState('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = users.find(user => user.email === email)
    
    if (existingUser) {
      setError('User with this email already exists')
      return
    }

    // Create new user (role forced to user)
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    setSuccess('Account created successfully! You can now sign in.')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="signup-root">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">Eventra</h2>
          <p className="signup-subtitle">Create your account</p>
        </div>

        {/* Admin signup disabled intentionally */}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Full Name</span>
            <input
              className="input"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

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

          <label className="field">
            <span className="field-label">Confirm Password</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button className="submit" type="submit">Create Account</button>
        </form>

        <div className="signup-footer">
          <p className="signin">Already have an account? <a className="link" href="#signin" onClick={onNavigateToLogin}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}

export default Signup
