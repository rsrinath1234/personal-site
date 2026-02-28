import { useEffect, useRef } from 'react'

const ROARS = ['RAAWR!! 🦕', 'STOMP! 🦖', 'ZOOM! 💨', 'YIKES! 😱', 'NEVER! 🏃', "CAN'T CATCH ME!", 'WHEEE!! 🌀']
const OBS_POSITIONS = [0.07, 0.16, 0.29, 0.41, 0.53, 0.64, 0.77, 0.9]
const GAP = 0.16

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
}

export default function DinoAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const roarBubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const roarBubble = roarBubbleRef.current
    if (!canvas || !roarBubble) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasEl = canvas
    const roarBubbleEl = roarBubble
    const ctxEl = ctx

    let W = 0, H = 0
    let PATH: { x: number; y: number }[] = []
    let scrollSpeed = 0
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
    let roarTimeout: ReturnType<typeof setTimeout> | null = null

    const obstacles = OBS_POSITIONS.map((t) => ({
      t,
      w: 13 + Math.random() * 7,
      h: 11 + Math.random() * 9,
    }))

    const dino1 = { t: 0, speed: 0.000135, jumpV: 0, jumpY: 0, isJumping: false, legPhase: 0, roaring: false, lookBack: 0 }
    const dino2 = { t: -GAP, speed: 0.000142, jumpV: 0, jumpY: 0, isJumping: false, legPhase: Math.PI, roaring: false, lookBack: 0 }

    let lastSeg1 = 0, lastSeg2 = 0
    let footprintTimer1 = 0, footprintTimer2 = 0
    const footprints: { x: number; y: number; angle: number; life: number }[] = []
    const dust: { x: number; y: number; vx: number; vy: number; life: number; r: number }[] = []

    function resize() {
      W = canvasEl.width = window.innerWidth
      H = canvasEl.height = window.innerHeight
      buildPath()
    }

    function buildPath() {
      const navH = 60
      const mx = 45
      PATH = [
        { x: mx, y: navH + 30 },
        { x: mx, y: H - 30 },
        { x: W - mx, y: H - 30 },
        { x: W - mx, y: navH + 30 },
      ]
    }

    function getPosOnPath(t: number) {
      const total = PATH.reduce((len, _, i) => {
        const a = PATH[i], b = PATH[(i + 1) % PATH.length]
        return len + Math.hypot(b.x - a.x, b.y - a.y)
      }, 0)
      let target = (((t % 1) + 1) % 1) * total
      for (let i = 0; i < PATH.length; i++) {
        const a = PATH[i], b = PATH[(i + 1) % PATH.length]
        const seg = Math.hypot(b.x - a.x, b.y - a.y)
        if (target <= seg) {
          const f = target / seg
          return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, angle: Math.atan2(b.y - a.y, b.x - a.x), seg: i }
        }
        target -= seg
      }
      return { x: PATH[0].x, y: PATH[0].y, angle: 0, seg: 0 }
    }

    function tryJump(dino: typeof dino1) {
      if (!dino.isJumping) {
        dino.isJumping = true
        dino.jumpV = -8.5
      }
    }

    function checkJumps(dino: typeof dino1) {
      const LOOK = 0.022
      for (const obs of obstacles) {
        const diff = ((obs.t - dino.t) % 1 + 1) % 1
        if (diff < LOOK && diff > 0.001) tryJump(dino)
      }
    }

    function addFootprint(x: number, y: number, angle: number) {
      footprints.push({ x, y, angle, life: 1.0 })
    }

    function updateFootprints(dt: number) {
      for (let i = footprints.length - 1; i >= 0; i--) {
        footprints[i].life -= 0.008 * (dt / 16)
        if (footprints[i].life <= 0) footprints.splice(i, 1)
      }
    }

    function drawFootprints() {
      for (const fp of footprints) {
        ctxEl.save()
        ctxEl.translate(fp.x, fp.y)
        ctxEl.rotate(fp.angle + Math.PI / 2)
        const alpha = fp.life * (isDark ? 0.5 : 0.35)
        ctxEl.fillStyle = isDark ? `rgba(100,170,255,${alpha})` : `rgba(66,120,184,${alpha})`
        ctxEl.beginPath()
        ctxEl.ellipse(-3, 0, 2, 3, 0, 0, Math.PI * 2)
        ctxEl.fill()
        ctxEl.beginPath()
        ctxEl.ellipse(3, 0, 2, 3, 0, 0, Math.PI * 2)
        ctxEl.fill()
        ctxEl.restore()
      }
    }

    function spawnDust(x: number, y: number) {
      for (let i = 0; i < 6; i++) {
        dust.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 1, r: 2 + Math.random() * 3 })
      }
    }

    function updateDust(dt: number) {
      for (let i = dust.length - 1; i >= 0; i--) {
        dust[i].x += dust[i].vx
        dust[i].y += dust[i].vy
        dust[i].life -= 0.05 * (dt / 16)
        if (dust[i].life <= 0) dust.splice(i, 1)
      }
    }

    function drawDust() {
      for (const p of dust) {
        ctxEl.beginPath()
        ctxEl.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctxEl.fillStyle = isDark ? `rgba(100,170,255,${p.life * 0.4})` : `rgba(190,200,216,${p.life * 0.6})`
        ctxEl.fill()
      }
    }

    function drawDino(
      x: number, y: number, jumpY: number, angle: number, legPhase: number,
      col: string, glowCol: string, lookBack: number, roaring: boolean
    ) {
      const S = 22
      const s = S / 20

      ctxEl.save()
      ctxEl.translate(x, y + jumpY)

      if (isDark) {
        ctxEl.shadowBlur = 18
        ctxEl.shadowColor = glowCol
      }

      const scaleX = lookBack > 0 ? -1 : 1
      ctxEl.rotate(angle + Math.PI / 2)
      ctxEl.scale(scaleX, 1)

      ctxEl.fillStyle = col
      ctxEl.strokeStyle = isDark ? 'rgba(100,170,255,0.4)' : 'rgba(66,120,184,0.35)'
      ctxEl.lineWidth = 0.8

      ctxEl.beginPath()
      roundRect(ctxEl, -7 * s, -10 * s, 14 * s, 12 * s, 3 * s)
      ctxEl.fill()
      ctxEl.stroke()

      ctxEl.beginPath()
      roundRect(ctxEl, 2 * s, -18 * s, 10 * s, 10 * s, 2 * s)
      ctxEl.fill()
      ctxEl.stroke()

      ctxEl.fillStyle = isDark ? '#6aa0e0' : '#4278b8'
      ctxEl.beginPath()
      const eyeR = roaring ? 2.8 * s : 1.8 * s
      ctxEl.arc(9 * s, -14 * s, eyeR, 0, Math.PI * 2)
      ctxEl.fill()

      if (roaring) {
        ctxEl.strokeStyle = isDark ? '#6aa0e0' : '#4278b8'
        ctxEl.lineWidth = 1.5
        ctxEl.beginPath()
        ctxEl.arc(11 * s, -10 * s, 3 * s, 0, Math.PI)
        ctxEl.stroke()
      }

      ctxEl.fillStyle = col
      ctxEl.strokeStyle = isDark ? 'rgba(100,170,255,0.35)' : 'rgba(66,120,184,0.35)'
      ctxEl.lineWidth = 0.8
      ctxEl.beginPath()
      roundRect(ctxEl, 10 * s, -12 * s, 5 * s, 4 * s, 1 * s)
      ctxEl.fill()
      ctxEl.stroke()

      ctxEl.beginPath()
      roundRect(ctxEl, 5 * s, -4 * s, 5 * s, 3 * s, 1 * s)
      ctxEl.fill()

      const legOff = Math.sin(legPhase) * 4 * s
      ctxEl.beginPath()
      roundRect(ctxEl, -5 * s, 2 * s, 4 * s, 8 * s + legOff, 1.5 * s)
      ctxEl.fill()
      ctxEl.stroke()
      ctxEl.beginPath()
      roundRect(ctxEl, 1 * s, 2 * s, 4 * s, 8 * s - legOff, 1.5 * s)
      ctxEl.fill()
      ctxEl.stroke()

      ctxEl.beginPath()
      ctxEl.moveTo(-7 * s, -6 * s)
      ctxEl.quadraticCurveTo(-18 * s, -2 * s, -14 * s, 6 * s)
      ctxEl.lineWidth = 3 * s
      ctxEl.strokeStyle = col
      ctxEl.stroke()

      ctxEl.restore()
    }

    function drawObstacle(obs: { t: number; w: number; h: number }) {
      const pos = getPosOnPath(obs.t)
      ctxEl.save()
      ctxEl.translate(pos.x, pos.y)
      ctxEl.rotate(pos.angle + Math.PI / 2)
      ctxEl.fillStyle = isDark ? 'rgba(100,160,255,0.35)' : 'rgba(66,120,184,0.45)'
      ctxEl.strokeStyle = isDark ? 'rgba(100,160,255,0.7)' : 'rgba(66,120,184,0.7)'
      ctxEl.lineWidth = 1
      if (isDark) {
        ctxEl.shadowBlur = 8
        ctxEl.shadowColor = 'rgba(100,160,255,0.4)'
      }
      ctxEl.beginPath()
      roundRect(ctxEl, -obs.w / 2, -obs.h, obs.w, obs.h, 2)
      ctxEl.fill()
      ctxEl.stroke()
      ctxEl.shadowBlur = 0
      ctxEl.fillStyle = isDark ? 'rgba(180,220,255,0.25)' : 'rgba(255,255,255,0.4)'
      ctxEl.beginPath()
      roundRect(ctxEl, -obs.w / 4, -obs.h * 0.75, obs.w * 0.3, obs.h * 0.25, 1)
      ctxEl.fill()
      ctxEl.restore()
    }

    function handleCanvasClick(e: MouseEvent) {
      const mx = e.clientX
      const my = e.clientY
      const pos1 = getPosOnPath(dino1.t)
      const pos2 = getPosOnPath(dino2.t)
      const hit1 = Math.hypot(mx - pos1.x, my - pos1.y) < 28
      const hit2 = Math.hypot(mx - pos2.x, my - pos2.y) < 28

      if (hit1 || hit2) {
        const pos = hit1 ? pos1 : pos2
        const dino = hit1 ? dino1 : dino2

        dino.roaring = true
        dino.lookBack = 1

        const roar = ROARS[Math.floor(Math.random() * ROARS.length)]
        roarBubbleEl.textContent = roar
        roarBubbleEl.style.left = pos.x - 60 + 'px'
        roarBubbleEl.style.top = pos.y - 60 + 'px'
        roarBubbleEl.classList.add('show')

        if (roarTimeout) clearTimeout(roarTimeout)
        roarTimeout = setTimeout(() => {
          roarBubbleEl.classList.remove('show')
          dino.roaring = false
          setTimeout(() => {
            dino.lookBack = 0
          }, 400)
        }, 1400)
      } else {
        canvasEl.style.pointerEvents = 'none'
        const el = document.elementFromPoint(mx, my)
        canvasEl.style.pointerEvents = 'auto'
        if (el && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.closest('a') || el.closest('button'))) {
          ;(el as HTMLElement).click()
        }
      }
    }

    let lastTime = 0
    let rafId = 0

    function loop(ts: number) {
      const dt = Math.min(ts - lastTime, 32)
      lastTime = ts
      const speedMult = 1 + scrollSpeed * 0.012

      dino1.t += dino1.speed * dt * speedMult
      dino2.t += dino2.speed * dt * speedMult
      dino1.legPhase += 0.14 * speedMult
      dino2.legPhase += 0.14 * speedMult

      ;[dino1, dino2].forEach((d) => {
        if (d.isJumping) {
          d.jumpV += 0.65
          d.jumpY += d.jumpV
          if (d.jumpY >= 0) {
            d.jumpY = 0
            d.jumpV = 0
            d.isJumping = false
          }
        }
      })

      checkJumps(dino1)
      checkJumps(dino2)

      const pos1 = getPosOnPath(dino1.t)
      const pos2 = getPosOnPath(dino2.t)

      if (pos1.seg !== lastSeg1) {
        spawnDust(pos1.x, pos1.y)
        lastSeg1 = pos1.seg
      }
      if (pos2.seg !== lastSeg2) {
        spawnDust(pos2.x, pos2.y)
        lastSeg2 = pos2.seg
      }

      footprintTimer1 += dt
      footprintTimer2 += dt
      if (footprintTimer1 > 280) {
        addFootprint(pos1.x, pos1.y, pos1.angle)
        footprintTimer1 = 0
      }
      if (footprintTimer2 > 280) {
        addFootprint(pos2.x, pos2.y, pos2.angle)
        footprintTimer2 = 0
      }

      updateFootprints(dt)
      updateDust(dt)

      ctxEl.clearRect(0, 0, W, H)

      drawFootprints()
      for (const obs of obstacles) drawObstacle(obs)
      drawDust()

      const d1col = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.95)'
      const d2col = isDark ? 'rgba(160,200,255,0.75)' : 'rgba(255,255,255,0.72)'
      const glow1 = isDark ? 'rgba(120,190,255,0.7)' : 'rgba(66,120,184,0.3)'
      const glow2 = isDark ? 'rgba(100,160,255,0.5)' : 'rgba(66,120,184,0.2)'

      drawDino(pos2.x, pos2.y, dino2.jumpY, pos2.angle, dino2.legPhase, d2col, glow2, dino2.lookBack, dino2.roaring)
      drawDino(pos1.x, pos1.y, dino1.jumpY, pos1.angle, dino1.legPhase, d1col, glow1, dino1.lookBack, dino1.roaring)

      rafId = requestAnimationFrame(loop)
    }

    const onScroll = () => {
      scrollSpeed = Math.min(window.scrollY / 8, 18)
    }

    resize()
    canvasEl.addEventListener('click', handleCanvasClick)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', resize)
    rafId = requestAnimationFrame(loop)

    return () => {
      canvasEl.removeEventListener('click', handleCanvasClick)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
      if (roarTimeout) clearTimeout(roarTimeout)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} id="dinoCanvas" className="dino-canvas" aria-hidden />
      <div ref={roarBubbleRef} className="dino-roar-bubble" id="roarBubble">
        RAAWR!! 🦕
      </div>
      <div className="dino-hint">Click a dino · Scroll to speed up</div>
    </>
  )
}
