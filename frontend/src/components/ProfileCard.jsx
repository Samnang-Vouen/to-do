import { useState } from 'react'
import { UserCircle, Mail, BadgeCheck, Edit3 } from 'lucide-react'

export default function ProfileCard({ user, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(user)

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEdit = () => {
    setForm(user)
    setIsEditing(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    onSave({ name, email: form.email.trim(), role: form.role.trim() })
    setIsEditing(false)
  }

  return (
    <section className="profile-card" aria-label="Operator Profile">
      <div className="profile-avatar" aria-hidden="true">
        {initials || <UserCircle size={26} />}
      </div>

      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>NAME</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </label>
          <label className="profile-field">
            <span>EMAIL</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label className="profile-field">
            <span>ROLE</span>
            <input type="text" name="role" value={form.role} onChange={handleChange} />
          </label>
          <div className="profile-form-actions">
            <button type="submit" className="save-edit-btn" disabled={!form.name.trim()}>
              [ SAVE ]
            </button>
            <button type="button" className="cancel-edit-btn" onClick={() => setIsEditing(false)}>
              [ CANCEL ]
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="profile-info">
            <span className="profile-label">OPERATOR PROFILE</span>
            <h2 className="profile-name">{user.name}</h2>
            <div className="profile-meta">
              {user.email && (
                <span>
                  <Mail size={12} /> {user.email}
                </span>
              )}
              {user.role && (
                <span>
                  <BadgeCheck size={12} /> {user.role}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={handleEdit}
            title="Edit profile"
            aria-label="Edit profile"
          >
            <Edit3 size={16} />
          </button>
        </>
      )}
    </section>
  )
}
