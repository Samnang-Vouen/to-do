import { Activity, Radio, Loader, CheckCircle, ShieldAlert } from 'lucide-react'

export default function TaskStats({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'done').length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const highPriority = tasks.filter((t) => t.status !== 'done' && t.priority === 'high').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <section className="stats-card" aria-label="System Telemetry">
      <div className="stats-header">
        <div className="stats-title-group">
          <h3>SYSTEM TELEMETRY // LOAD METRICS</h3>
          <p>
            {completed} / {total} DIRECTIVES RESOLVED
          </p>
        </div>
        <div className="stats-percent-badge">{percentage}% PWR</div>
      </div>

      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>

      <div className="stats-chips-row">
        <div className="stat-chip">
          <span className="stat-chip-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> TOTAL_DIR
          </span>
          <span className="stat-chip-value">{total}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={12} /> TO_DO
          </span>
          <span className="stat-chip-value">{todo}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
            <Loader size={12} /> IN_PROGRESS
          </span>
          <span className="stat-chip-value" style={{ color: 'var(--warning)' }}>{inProgress}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
            <CheckCircle size={12} /> RESOLVED
          </span>
          <span className="stat-chip-value" style={{ color: 'var(--success)' }}>{completed}</span>
        </div>
        <div className="stat-chip">
          <span
            className="stat-chip-label"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: highPriority > 0 ? 'var(--danger)' : 'inherit',
            }}
          >
            <ShieldAlert size={12} /> CRITICAL
          </span>
          <span className="stat-chip-value" style={{ color: highPriority > 0 ? 'var(--danger)' : 'inherit' }}>
            {highPriority}
          </span>
        </div>
      </div>
    </section>
  )
}
