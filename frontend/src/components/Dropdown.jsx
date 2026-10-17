import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import './Dropdown.css'

/**
 * Reusable Dropdown Component
 *
 * @param {Array<{value: string|number, label: string, icon?: React.ReactNode}> | string[]} options
 * @param {string|number} value - Selected value
 * @param {(value: any) => void} onChange - Callback when an option is selected
 * @param {string} [placeholder='Select an option'] - Placeholder text
 * @param {string} [label] - Optional field label
 * @param {React.ReactNode} [icon] - Optional leading icon in the trigger
 * @param {'sm'|'md'|'lg'} [size='md'] - Dropdown size
 * @param {boolean} [disabled=false] - Disabled state
 * @param {string} [className=''] - Optional custom CSS class
 */
export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  icon,
  size = 'md',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Normalize options to { value, label, icon }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'object' && opt !== null ? opt : { value: opt, label: String(opt) }
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  // Keyboard controls
  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    }
  }

  const handleSelect = (optValue) => {
    onChange?.(optValue)
    setIsOpen(false)
  }

  return (
    <div
      className={`custom-dropdown-container size-${size} ${className}`}
      ref={dropdownRef}
    >
      {label && <label className="custom-dropdown-label">{label}</label>}

      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-dropdown-value">
          {icon && <span className="custom-dropdown-option-icon">{icon}</span>}
          {selectedOption?.icon && (
            <span className="custom-dropdown-option-icon">{selectedOption.icon}</span>
          )}
          {selectedOption ? (
            <span>{selectedOption.label}</span>
          ) : (
            <span className="custom-dropdown-placeholder">{placeholder}</span>
          )}
        </span>

        <ChevronDown size={15} className="custom-dropdown-chevron" />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox" tabIndex={-1}>
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`custom-dropdown-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="custom-dropdown-option-content">
                  {opt.icon && (
                    <span className="custom-dropdown-option-icon">{opt.icon}</span>
                  )}
                  <span>{opt.label}</span>
                </span>

                {isSelected && (
                  <Check size={14} className="custom-dropdown-check-icon" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
