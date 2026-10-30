import { useState } from 'react'
import { Check, Edit3, Trash2, AlertTriangle, Clock, UserCircle } from 'lucide-react'

const STATUS_ORDER = ['todo', 'in-progress', 'done']

const STATUS_LABELS = {
  todo: 'TO DO',
  'in-progress': 'IN PROGRESS',
  done: 'DONE',
}

export default function TaskItem({
  task,
  canManage,
  operators = [],
  onAssign,
  onStatusChange,
  onDelete,
  onEdit,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const isDone = task.status === 'done'

  const handleCycleStatus = () => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length]
    onStatusChange(task.id, next)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  // Format Due Date and detect overdue
  const getDueDateInfo = (dateString) => {
    if (!dateString) return null
    const due = new Date(dateString + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isOverdue = due < today && !isDone
    const isToday = due.getTime() === today.getTime()

    const formatted = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }).toUpperCase()

    return { formatted, isOverdue, isToday }
  }

  const dueDateInfo = getDueDateInfo(task.dueDate)

  const categoryLabels = {
    Work: 'SYS_OPS',
    Personal: 'PERSONAL',
    Study: 'NEURAL_DATA',
    Health: 'BIO_RHYTHM',
    Other: 'AUXILIARY',
  }

  const priorityLabels = {
    high: 'CRITICAL',
    medium: 'ELEVATED',
    low: 'STANDARD',
  }

  return (
    <div className={`task-item-card ${isDone ? 'completed' : ''}`}>
      {/* Priority Colored Accent Strip on the left */}
      <div className={`priority-strip priority-${task.priority}`} aria-hidden="true" />

      {/* Checkbox: quick toggle between To Do and Done */}
      <button
        type="button"
        className={`task-checkbox-btn ${isDone ? 'checked' : ''}`}
        onClick={() => onStatusChange(task.id, isDone ? 'todo' : 'done')}
        aria-label={isDone ? 'Mark as to do' : 'Mark as done'}
      >
        {isDone && <Check size={13} strokeWidth={3} />}
      </button>

      {/* Content or Edit Form */}
      {isEditing ? (
        <form className="task-edit-form" onSubmit={handleSave}>
          <input
            type="text"
            className="task-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            aria-label="Edit directive title"
          />
          <button type="submit" className="save-edit-btn">
            [ COMMIT ]
          </button>
          <button type="button" className="cancel-edit-btn" onClick={handleCancel}>
            [ CANCEL ]
          </button>
        </form>
      ) : (
        <div className="task-content">
          <div
            className="task-title"
            onDoubleClick={canManage ? () => setIsEditing(true) : undefined}
          >
            {task.title}
          </div>

          <div className="task-meta-row">
            {/* Status Badge (click to cycle To Do → In Progress → Done) */}
            <button
              type="button"
              className={`badge badge-status status-${task.status}`}
              onClick={handleCycleStatus}
              title="Click to change status"
              aria-label={`Status: ${STATUS_LABELS[task.status]}. Click to change`}
            >
              {STATUS_LABELS[task.status] || task.status}
            </button>

            {/* Category Tag */}
            <span className={`badge badge-category category-${task.category.toLowerCase()}`}>
              {categoryLabels[task.category] || task.category}
            </span>

            {/* Priority Badge */}
            <span className={`badge badge-priority priority-${task.priority}`}>
              [{priorityLabels[task.priority] || task.priority}]
            </span>

            {/* Due Date Badge */}
            {dueDateInfo && (
              <span
                className={`badge badge-due-date ${
                  dueDateInfo.isOverdue ? 'overdue' : dueDateInfo.isToday ? 'due-today' : ''
                }`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {dueDateInfo.isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
                {dueDateInfo.isOverdue ? 'CRIT_OVERDUE' : dueDateInfo.isToday ? 'T-MINUS 0d' : dueDateInfo.formatted}
              </span>
            )}

            {/* Assignee: admins can reassign (native select, since the card clips popups) */}
            {canManage && (
              <label className="badge badge-assignee" title="Assign to operator">
                <UserCircle size={10} />
                <select
                  value={task.userId ?? ''}
                  onChange={(e) => onAssign(task.id, e.target.value ? Number(e.target.value) : null)}
                  aria-label="Assign to operator"
                >
                  <option value="">UNASSIGNED</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Actions: admin only */}
      {canManage && !isEditing && (
        <div className="task-actions">
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={() => setIsEditing(true)}
            title="Edit directive"
            aria-label="Edit directive"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            title="Purge directive"
            aria-label="Purge directive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
