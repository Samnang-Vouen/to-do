import { Search, X, SlidersHorizontal } from 'lucide-react'
import Dropdown from './Dropdown'

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}) {
  const categories = [
    { id: 'All', label: 'ALL_DOMAINS' },
    { id: 'Work', label: 'SYS_OPS' },
    { id: 'Personal', label: 'PERSONAL' },
    { id: 'Study', label: 'NEURAL_DATA' },
    { id: 'Health', label: 'BIO_RHYTHM' },
    { id: 'Other', label: 'AUXILIARY' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'TIMESTAMP: NEW' },
    { value: 'oldest', label: 'TIMESTAMP: OLD' },
    { value: 'priority', label: 'PRIORITY: CRIT' },
    { value: 'dueDate', label: 'DEADLINE: SOON' },
    { value: 'alphabetical', label: 'ALPHA: A-Z' },
  ]

  return (
    <div className="controls-container">
      {/* Search and Sort Row */}
      <div className="search-and-sort-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="SCAN DIRECTIVES DATABANK..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Scan directives"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Purge search query"
              aria-label="Purge search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-select-wrapper">
          <Dropdown
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            icon={<SlidersHorizontal size={14} />}
            size="md"
          />
        </div>
      </div>

      {/* Filter Tabs and Category Chips */}
      <div className="filter-tags-row">
        <div className="status-tabs" role="tablist" aria-label="Directive Status Filter">
          {[
            { id: 'all', label: 'ALL_UNITS' },
            { id: 'todo', label: 'TO DO' },
            { id: 'in-progress', label: 'IN PROGRESS' },
            { id: 'done', label: 'DONE' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={statusFilter === id}
              className={`status-tab ${statusFilter === id ? 'active' : ''}`}
              onClick={() => onStatusChange(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="category-chips" role="group" aria-label="Filter by Domain">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${categoryFilter === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
