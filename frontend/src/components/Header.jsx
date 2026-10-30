import { Cpu, Terminal, Sun, Moon, Radio, UserCircle, LogOut } from 'lucide-react'

export default function Header({ theme, onToggleTheme, username, onLogout }) {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date()).toUpperCase()

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-icon" aria-hidden="true">
          <Cpu size={26} strokeWidth={2} />
        </div>
        <div className="brand-title-group">
          <h1>TASK_OS // COMMAND</h1>
          <div className="brand-subtitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--success)' }}>
              <Radio size={12} className="pulse-dot" /> SYS.ONLINE
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Terminal size={12} /> CYCLE: {todayFormatted}
            </span>
          </div>
        </div>
      </div>

      <div className="header-controls">
        <div className="header-user" title={`Signed in as ${username}`}>
          <UserCircle size={17} />
          <span className="header-username">{username}</span>
        </div>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch environment matrix (${theme === 'dark' ? 'Station Lab' : 'Cyber Void'})`}
          aria-label="Toggle environment matrix"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
