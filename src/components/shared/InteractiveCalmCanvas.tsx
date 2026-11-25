import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, Pause, Play } from 'lucide-react'

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulseSpeed: number
  pulsePhase: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

interface InteractiveCalmCanvasProps {
  className?: string
}

export const InteractiveCalmCanvas: React.FC<InteractiveCalmCanvasProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const isPausedRef = useRef(isPaused)
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = container.clientWidth)
    let height = (canvas.height = container.clientHeight)

    // Palette tailored for mental health & equilibrium (caring teals, soft emeralds, subtle cyan)
    const particleColors = [
      '20, 184, 166', // teal-500
      '13, 148, 136', // teal-600
      '16, 185, 129', // emerald-500
      '45, 212, 191', // teal-400
      '94, 234, 212', // teal-300
    ]

    // Create organic particles based on viewport size
    const particleCount = Math.min(Math.max(Math.floor((width * height) / 18000), 36), 75)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: Math.random() * 0.45 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 170,
      isHovered: false,
    }

    const ripples: Ripple[] = []

    const handleResize = () => {
      if (!container || !canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = container.clientWidth
      height = container.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
      mouse.isHovered = true
      if (!hasInteracted) setHasInteracted(true)
    }

    const handlePointerLeave = () => {
      mouse.targetX = -1000
      mouse.targetY = -1000
      mouse.isHovered = false
    }

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.4,
        alpha: 0.5,
      })
      if (!hasInteracted) setHasInteracted(true)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)
    container.addEventListener('pointerdown', handlePointerDown)

    let globalTime = 0

    const render = () => {
      if (!isPausedRef.current) {
        globalTime += 0.015

        // Smooth cursor interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.1
        mouse.y += (mouse.targetY - mouse.y) * 0.1

        // 1. Deep Oceanic Calm Background
        const bgGradient = ctx.createLinearGradient(0, 0, width, height)
        bgGradient.addColorStop(0, '#030712') // deep slate 950
        bgGradient.addColorStop(0.5, '#06131c') // subtle teal-midnight
        bgGradient.addColorStop(1, '#020617') // midnight
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, width, height)

        // 2. Ambient Ethereal Breathing Glows
        const breathingScale = Math.sin(globalTime * 0.7) * 0.15 + 0.85
        const centerGlow = ctx.createRadialGradient(
          width * 0.5,
          height * 0.45,
          20,
          width * 0.5,
          height * 0.45,
          width * 0.45 * breathingScale
        )
        centerGlow.addColorStop(0, 'rgba(13, 148, 136, 0.18)')
        centerGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)')
        centerGlow.addColorStop(1, 'rgba(2, 6, 23, 0)')
        ctx.fillStyle = centerGlow
        ctx.fillRect(0, 0, width, height)

        // Subtle secondary breathing glow
        const sideGlow = ctx.createRadialGradient(
          width * 0.8,
          height * 0.2,
          10,
          width * 0.8,
          height * 0.2,
          width * 0.35
        )
        sideGlow.addColorStop(0, 'rgba(20, 184, 166, 0.12)')
        sideGlow.addColorStop(1, 'rgba(2, 6, 23, 0)')
        ctx.fillStyle = sideGlow
        ctx.fillRect(0, 0, width, height)

        // 3. Render Expanding Ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i]
          r.radius += 2.2
          r.alpha *= 0.965

          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(45, 212, 191, ${r.alpha * 0.45})`
          ctx.lineWidth = 1.5
          ctx.stroke()

          if (r.alpha < 0.01 || r.radius > r.maxRadius) {
            ripples.splice(i, 1)
          }
        }

        // 4. Update & Draw Neural Equilibrium Mesh / Connections
        const maxConnectDist = Math.min(width * 0.18, 135)
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i]

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < maxConnectDist) {
              const lineAlpha = (1 - dist / maxConnectDist) * 0.22
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha})`
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
        }

        // 5. Update & Draw Particles with Soft Glow
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]

          // Gentle autonomous floating
          p.x += p.vx
          p.y += p.vy
          p.pulsePhase += p.pulseSpeed

          // Wrap edges smoothly
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10

          // Interactive cursor reaction (gentle magnetic push/attraction)
          if (mouse.isHovered) {
            const mdx = p.x - mouse.x
            const mdy = p.y - mouse.y
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy)

            if (mDist < mouse.radius && mDist > 0) {
              const force = (1 - mDist / mouse.radius) * 1.8
              p.x += (mdx / mDist) * force
              p.y += (mdy / mDist) * force

              // Connect to mouse with luminous line
              const mouseLineAlpha = (1 - mDist / mouse.radius) * 0.35
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(mouse.x, mouse.y)
              ctx.strokeStyle = `rgba(94, 234, 212, ${mouseLineAlpha})`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }

          // Render particle node
          const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.15
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color}, ${Math.max(currentAlpha, 0.1)})`
          ctx.shadowColor = `rgba(${p.color}, 0.5)`
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      container.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [hasInteracted])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden cursor-crosshair ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto select-none"
        aria-hidden="true"
      />

      {/* Floating Canvas Interactive Controls */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/75 hover:bg-slate-900/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-lg text-xs font-medium cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-400"
          title={isPaused ? 'Lanjutkan gerakan interaktif' : 'Jeda animasi'}
          aria-label={isPaused ? 'Putar animasi latar' : 'Jeda animasi latar'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-teal-300" /> : <Pause className="w-3.5 h-3.5 text-teal-300" />}
          <span className="hidden sm:inline">{isPaused ? 'Putar' : 'Jeda'} Animasi</span>
        </button>

        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/60 border border-teal-800/40 text-teal-300/90 text-xs backdrop-blur-xs select-none">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>Gerakkan kursor untuk interaksi</span>
        </div>
      </div>
    </div>
  )
}
