import { Terminal, ShieldAlert, Trash2 } from 'lucide-react'
import TaskItem from './TaskItem'

export default function TaskList({
  tasks,
  canManage,
  operators,
  onAssign,
  onStatusChange,
  onDelete,
  onEdit,
  onClearCompleted,
  totalCompletedCount,
  hasActiveFilters,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-state-icon">
          {hasActiveFilters ? <ShieldAlert size={46} strokeWidth={1.5} /> : <Terminal size={46} strokeWidth={1.5} />}
        </div>
        <h4 className="empty-state-title">
          {hasActiveFilters ? '// NO DIRECTIVES MATCH FILTER QUERY' : '// ALL BUFFER DIRECTIVES RESOLVED'}
        </h4>
        <p className="empty-state-desc">
          {hasActiveFilters
            ? 'Adjust scan parameters, domain filters, or query string.'
            : canManage
              ? 'Operational queue is idle. Initiate a new directive from the terminal above.'
              : 'No directives assigned to you yet.'}
        </p>
      </div>
    )
  }

  return (
    <section className="task-list-section" aria-label="Directives Queue">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          canManage={canManage}
          operators={operators}
          onAssign={onAssign}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}

      <div className="list-footer">
        <span>
          TELEMETRY_COUNT: {tasks.length} UNIT{tasks.length === 1 ? '' : 'S'}
        </span>
        {canManage && totalCompletedCount > 0 && (
          <button
            type="button"
            className="clear-completed-btn"
            onClick={onClearCompleted}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={13} />
            <span>[ PURGE RESOLVED ({totalCompletedCount}) ]</span>
          </button>
        )}
      </div>
    </section>
  )
}
