import { useState } from 'react'
import { Cpu, LogIn, UserPlus } from 'lucide-react'
import { authApi } from '../Api.js'

export default function LoginPage({ onSignedIn }) {
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register')
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const email = form.email.trim()
      if (isRegister) {
        await authApi.register(form.name.trim(), email, form.password)
      } else {
        await authApi.login(email, form.password)
      }
      // Login and register only set cookies, so fetch the profile separately
      onSignedIn(await authApi.me())
    } catch (err) {
      setError(err.status === 429 ? 'Too many attempts. Wait a minute and try again.' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app-container login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-logo-icon" aria-hidden="true">
            <Cpu size={26} strokeWidth={2} />
          </div>
          <div>
            <h1>TASK_OS // COMMAND</h1>
            <span className="login-subtitle">
              {isRegister ? 'REGISTER NEW OPERATOR' : 'OPERATOR AUTHENTICATION'}
            </span>
          </div>
        </div>

        {isRegister && (
          <label className="profile-field">
            <span>NAME</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              required
            />
          </label>
        )}
        <label className="profile-field">
          <span>EMAIL</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            autoFocus
          />
        </label>
        <label className="profile-field">
          <span>PASSWORD</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 8 : undefined}
            maxLength={isRegister ? 18 : undefined}
            required
          />
        </label>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="submit-task-btn login-submit" disabled={submitting}>
          {isRegister ? <UserPlus size={15} /> : <LogIn size={15} />}
          <span>{submitting ? '[ CONNECTING... ]' : isRegister ? '[ REGISTER ]' : '[ SIGN IN ]'}</span>
        </button>

        <button type="button" className="login-switch" onClick={switchMode}>
          {isRegister ? 'Already registered? Sign in' : 'No account? Register'}
        </button>
      </form>
    </main>
  )
}
