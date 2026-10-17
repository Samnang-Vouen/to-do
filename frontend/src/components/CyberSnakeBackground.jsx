import { useEffect, useRef } from 'react'

/**
 * CyberSnakeBackground
 *
 * Renders an interactive Sci-Fi cyber snake on a fixed full-screen canvas
 * that aligns to the 36px background grid and tracks the user's cursor.
 */
export default function CyberSnakeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GRID_SIZE = 36 // Exact match to CSS background-size
    const SNAKE_LENGTH = 16 // Number of body segments
    const MOVE_INTERVAL = 65 // Milliseconds per grid step

    let animationFrameId
    let lastStepTime = 0
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Initial snake position in grid coordinates (center screen)
    let startX = Math.floor(width / (2 * GRID_SIZE))
    let startY = Math.floor(height / (2 * GRID_SIZE))

    // Snake body array of { x, y } in grid coordinates
    const snake = []
    for (let i = 0; i < SNAKE_LENGTH; i++) {
      snake.push({ x: startX - i, y: startY })
    }

    // Target position in grid coordinates
    let targetX = startX
    let targetY = startY
    let isMouseActive = false
    let lastInputTime = Date.now()

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Mouse movement handler
    const handleMouseMove = (e) => {
      isMouseActive = true
      lastInputTime = Date.now()
      targetX = Math.floor(e.clientX / GRID_SIZE)
      targetY = Math.floor(e.clientY / GRID_SIZE)
    }

    // Touch support for mobile devices
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        isMouseActive = true
        lastInputTime = Date.now()
        targetX = Math.floor(e.touches[0].clientX / GRID_SIZE)
        targetY = Math.floor(e.touches[0].clientY / GRID_SIZE)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    // Autonomous wandering when mouse is idle
    let wanderCounter = 0
    const wanderDirections = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ]
    let currentWanderDir = wanderDirections[0]

    // Step logic: Moves snake head one step on the grid
    const stepSnake = () => {
      const head = snake[0]
      let nextX = head.x
      let nextY = head.y

      if (Date.now() - lastInputTime > 3000) {
        isMouseActive = false
      }

      const dx = targetX - head.x
      const dy = targetY - head.y

      // If idle or reached target cell, wander autonomously
      if (!isMouseActive || (Math.abs(dx) === 0 && Math.abs(dy) === 0)) {
        wanderCounter++
        if (wanderCounter % 5 === 0) {
          currentWanderDir =
            wanderDirections[Math.floor(Math.random() * wanderDirections.length)]
        }
        nextX += currentWanderDir.dx
        nextY += currentWanderDir.dy
      } else {
        // Manhattan grid step towards cursor: prioritize larger delta
        if (Math.abs(dx) > Math.abs(dy)) {
          nextX += Math.sign(dx)
        } else if (Math.abs(dy) > 0) {
          nextY += Math.sign(dy)
        } else {
          nextX += Math.sign(dx)
        }
      }

      // Boundary clamp to visible grid
      const maxGridX = Math.ceil(width / GRID_SIZE)
      const maxGridY = Math.ceil(height / GRID_SIZE)
      nextX = (nextX + maxGridX) % maxGridX
      nextY = (nextY + maxGridY) % maxGridY

      // Prepend new head and drop tail
      snake.unshift({ x: nextX, y: nextY })
      if (snake.length > SNAKE_LENGTH) {
        snake.pop()
      }
    }

    // Render loop
    const render = (currentTime) => {
      // Step on grid interval
      if (currentTime - lastStepTime > MOVE_INTERVAL) {
        stepSnake()
        lastStepTime = currentTime
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Detect theme for appropriate glow colors
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const primaryGlow = isDark ? '#00f0ff' : '#0284c7'
      const secondaryGlow = isDark ? '#bd00ff' : '#7c3aed'

      // 1. Draw glowing grid trail lines between segments
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = snake.length - 1; i > 0; i--) {
        const segA = snake[i]
        const segB = snake[i - 1]

        // Skip wrap-around line jumps
        if (Math.abs(segA.x - segB.x) > 1 || Math.abs(segA.y - segB.y) > 1) {
          continue
        }

        const progress = 1 - i / snake.length
        const alpha = Math.max(0.08, progress * 0.75)

        const x1 = segA.x * GRID_SIZE + GRID_SIZE / 2
        const y1 = segA.y * GRID_SIZE + GRID_SIZE / 2
        const x2 = segB.x * GRID_SIZE + GRID_SIZE / 2
        const y2 = segB.y * GRID_SIZE + GRID_SIZE / 2

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)

        ctx.strokeStyle = i < 4 ? primaryGlow : secondaryGlow
        ctx.globalAlpha = alpha
        ctx.lineWidth = Math.max(2, progress * 5)
        ctx.shadowColor = primaryGlow
        ctx.shadowBlur = progress * 10
        ctx.stroke()
      }
      ctx.restore()

      // 2. Draw body nodes and glowing head
      for (let i = snake.length - 1; i >= 0; i--) {
        const seg = snake[i]
        const centerX = seg.x * GRID_SIZE + GRID_SIZE / 2
        const centerY = seg.y * GRID_SIZE + GRID_SIZE / 2
        const progress = 1 - i / snake.length

        ctx.save()
        if (i === 0) {
          // --- Snake Head: High-Tech Diamond / Reticle ---
          ctx.shadowColor = primaryGlow
          ctx.shadowBlur = 18
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = primaryGlow
          ctx.lineWidth = 2

          const headRadius = 7
          ctx.beginPath()
          ctx.moveTo(centerX, centerY - headRadius)
          ctx.lineTo(centerX + headRadius, centerY)
          ctx.lineTo(centerX, centerY + headRadius)
          ctx.lineTo(centerX - headRadius, centerY)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Outer pulsing radar ring
          ctx.beginPath()
          ctx.arc(centerX, centerY, headRadius + 4, 0, Math.PI * 2)
          ctx.strokeStyle = primaryGlow
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.6
          ctx.stroke()
        } else {
          // --- Body Segment: Cybernetic Grid Node ---
          const size = Math.max(2.5, progress * 5.5)
          const alpha = Math.max(0.12, progress * 0.85)

          ctx.fillStyle = i < 6 ? primaryGlow : secondaryGlow
          ctx.shadowColor = primaryGlow
          ctx.shadowBlur = progress * 8
          ctx.globalAlpha = alpha

          ctx.beginPath()
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  )
}
