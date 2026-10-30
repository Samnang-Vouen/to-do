import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import TaskStats from './components/TaskStats'
import TaskForm from './components/TaskForm'
import TaskFilters from './components/TaskFilters'
import TaskList from './components/TaskList'
import ProfileCard from './components/ProfileCard'
import CyberSnakeBackground from './components/CyberSnakeBackground'
import LoginPage from './components/LoginPage'
import { authApi, onUnauthorized, todosApi, usersApi } from './Api.js'
import './App.css'

// const INITIAL_TASKS = [
//   {
//     id: 'task-1',
//     title: 'Initialize orbital station telemetry & uplink sensors',
//     category: 'Work',
//     priority: 'high',
//     dueDate: new Date().toISOString().split('T')[0],
//     status: 'done',
//     createdAt: Date.now() - 3600000 * 4,
//   },
//   {
//     id: 'task-2',
//     title: 'Compile neural network kernel patch v4.8',
//     category: 'Work',
//     priority: 'high',
//     dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
//     status: 'in-progress',
//     createdAt: Date.now() - 3600000 * 2,
//   },
//   {
//     id: 'task-3',
//     title: 'Defragment cybernetic cognitive matrix',
//     category: 'Study',
//     priority: 'medium',
//     dueDate: null,
//     status: 'todo',
//     createdAt: Date.now() - 3600000,
//   },
//   {
//     id: 'task-4',
//     title: 'Execute daily bio-sync regeneration protocol',
//     category: 'Health',
//     priority: 'low',
//     dueDate: new Date().toISOString().split('T')[0],
//     status: 'todo',
//     createdAt: Date.now(),
//   },
// ]

// Older saved tasks used a `completed` boolean instead of `status`
const normalizeTask = (task) => {
  if (task.status) return task
  const { completed, ...rest } = task
  return { ...rest, status: completed ? 'done' : 'todo' }
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('taskflow_theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('taskflow_theme', theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Signed-in user: undefined while checking the session, null when signed out
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    onUnauthorized(() => setUser(null))
    authApi.me().then(setUser).catch(() => setUser(null))
  }, [])

  const handleLogout = async () => {
    await authApi.logout()
    setUser(null)
    setTasks([])
  }

  const handleSaveProfile = async ({ name, email }) => {
    setUser(await usersApi.update(user.id, { name, email }))
  }

  // Tasks state: load from the backend once the user is signed in
const [tasks, setTasks] = useState([])
const [error, setError] = useState(null)

const userId = user?.id
useEffect(() => {
  if (!userId) return
  todosApi.getAll().then(setTasks).catch((e) => setError(e.message))
}, [userId])

// Operators the admin can assign tasks to (GET /users is admin-only)
const [operators, setOperators] = useState([])
const userRole = user?.role

useEffect(() => {
  if (userRole !== 'admin') return
  usersApi
    .getAll()
    .then((users) => setOperators(users.filter((u) => u.role === 'operator')))
    .catch((e) => setError(e.message))
}, [userRole])

// Task actions: call the API first, then update the screen
const handleAddTask = async ({ title, category, priority, dueDate, userId }) => {
  const created = await todosApi.create({ title, category, priority, dueDate: dueDate || null, userId })
  setTasks((prev) => [created, ...prev])
}

// userId null = unassign
const handleAssignTask = async (id, userId) => {
  const updated = await todosApi.update(id, { userId })
  setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
}

const handleStatusChange = async (id, status) => {
  const updated = await todosApi.updateStatus(id, status)
  setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
}

const handleEditTask = async (id, title) => {
  const updated = await todosApi.update(id, { title })
  setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
}

const handleDeleteTask = async (id) => {
  await todosApi.remove(id)
  setTasks((prev) => prev.filter((t) => t.id !== id))
}

const handleClearCompleted = async () => {
  const done = tasks.filter((t) => t.status === 'done')
  await Promise.all(done.map((t) => todosApi.remove(t.id)))   // no bulk endpoint, so delete one by one
  setTasks((prev) => prev.filter((t) => t.status !== 'done'))
}

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | todo | in-progress | done
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest') // newest | oldest | priority | dueDate | alphabetical

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) return false

        // Category filter
        if (categoryFilter !== 'All' && task.category !== categoryFilter) return false

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          return (
            task.title.toLowerCase().includes(query) ||
            task.category.toLowerCase().includes(query)
          )
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt
        if (sortBy === 'oldest') return a.createdAt - b.createdAt
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title)
        if (sortBy === 'priority') {
          const priorityWeights = { high: 3, medium: 2, low: 1 }
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        return 0
      })
  }, [tasks, statusFilter, categoryFilter, searchQuery, sortBy])

  const totalCompletedCount = tasks.filter((t) => t.status === 'done').length
  const hasActiveFilters =
    Boolean(searchQuery.trim()) || statusFilter !== 'all' || categoryFilter !== 'All'

  if (user === undefined) return <CyberSnakeBackground />

  if (!user) {
    return (
      <>
        <CyberSnakeBackground />
        <LoginPage onSignedIn={setUser} />
      </>
    )
  }

  // Operators can only change status; creating, editing and deleting are admin-only
  const isAdmin = user.role === 'admin'

  return (
    <>
      <CyberSnakeBackground />
      <main className="app-container">
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        username={user.name}
        onLogout={handleLogout}
      />

      <ProfileCard user={user} onSave={handleSaveProfile} />

      <TaskStats tasks={tasks} />

      {isAdmin && <TaskForm onAddTask={handleAddTask} operators={operators} />}

      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <TaskList
        tasks={filteredTasks}
        canManage={isAdmin}
        operators={operators}
        onAssign={handleAssignTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onClearCompleted={handleClearCompleted}
        totalCompletedCount={totalCompletedCount}
        hasActiveFilters={hasActiveFilters}
      />
    </main>
    </>
  )
}
