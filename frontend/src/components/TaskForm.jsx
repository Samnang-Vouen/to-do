import { useState } from 'react'
import { Terminal, Shield, Calendar, Layers, Cpu, User, BookOpen, HeartPulse, HardDrive } from 'lucide-react'
import Dropdown from './Dropdown'

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Work')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  const categoryOptions = [
    { value: 'Work', label: 'SYS_OPS', icon: <Cpu size={13} /> },
    { value: 'Personal', label: 'PERSONAL', icon: <User size={13} /> },
    { value: 'Study', label: 'NEURAL_DATA', icon: <BookOpen size={13} /> },
    { value: 'Health', label: 'BIO_RHYTHM', icon: <HeartPulse size={13} /> },
    { value: 'Other', label: 'AUXILIARY', icon: <HardDrive size={13} /> },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    onAddTask({
      title: trimmed,
      category,
      priority,
      dueDate: dueDate || null,
    })

    setTitle('')
    setDueDate('')
  }

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      <div className="task-input-row">
        <input
          type="text"
          className="task-main-input"
          placeholder="> Enter mission directive parameters..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Directive title input"
        />
        <button
          type="submit"
          className="submit-task-btn"
          disabled={!title.trim()}
          aria-label="Initiate Directive"
        >
          <Terminal size={15} strokeWidth={2.5} />
          <span>[ + INITIATE ]</span>
        </button>
      </div>

      <div className="task-options-row">
        {/* Reusable Category Dropdown */}
        <div className="option-group" style={{ minWidth: '160px' }}>
          <span className="option-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={13} /> DOMAIN:
          </span>
          <Dropdown
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            size="sm"
          />
        </div>

        {/* Priority selector */}
        <div className="option-group">
          <span className="option-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={13} /> PRIORITY:
          </span>
          <div className="priority-selector" role="radiogroup" aria-label="Task Priority">
            {[
              { id: 'low', label: 'STANDARD' },
              { id: 'medium', label: 'ELEVATED' },
              { id: 'high', label: 'CRITICAL' },
            ].map(({ id, label }) => (
              <button
                type="button"
                key={id}
                className={`priority-btn priority-${id} ${priority === id ? 'active' : ''}`}
                onClick={() => setPriority(id)}
                role="radio"
                aria-checked={priority === id}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date picker */}
        <div className="option-group">
          <label htmlFor="task-due-date" className="option-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> DEADLINE:
          </label>
          <input
            id="task-due-date"
            type="date"
            className="form-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
    </form>
  )
}
