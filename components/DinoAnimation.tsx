import { useEffect, useRef } from 'react'

const BLURB_SOUNDS = ['Bloop!', 'Whee!', 'Boing!', 'Woop!', 'Bounce!', 'Hehe!', 'Whee!', '~']
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

    const blob1 = { t: 0, speed: 0.000045, jumpVel: 0, jumpDist: 0, jumpDir: { x: 0, y: -1 }, isJumping: false, legPhase: 0, excited: false, lookBack: 0 }
    const blob2 = { t: -GAP, speed: 0.000048, jumpVel: 0, jumpDist: 0, jumpDir: { x: 0, y: -1 }, isJumping: false, legPhase: Math.PI, excited: false, lookBack: 0 }

    let lastSeg1 = 0, lastSeg2 = 0
    let footprintTimer1 = 0, footprintTimer2 = 0
    let collisionCooldown = 0
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
      // Full rectangle path on all screen sizes — blobs run around the whole page
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
        const dx = b.x - a.x, dy = b.y - a.y
        const seg = Math.hypot(dx, dy)
        if (target <= seg) {
          const f = target / seg
          const x = a.x + dx * f
          const y = a.y + dy * f
          const angle = Math.atan2(dy, dx)
          // Inward = perpendicular to path, pointing toward content
          // (dy, -dx) for clockwise rectangle
          const inLen = Math.hypot(dy, -dx) || 1
          const inward = { x: dy / inLen, y: -dx / inLen }
          return { x, y, angle, seg: i, inward }
        }
        target -= seg
      }
      const a = PATH[0], b = PATH[1]
      const dx = b.x - a.x, dy = b.y - a.y
      const inLen = Math.hypot(dy, -dx) || 1
      const inward = { x: dy / inLen, y: -dx / inLen }
      return { x: PATH[0].x, y: PATH[0].y, angle: Math.atan2(dy, dx), seg: 0, inward }
    }

    const lastObstacleJumped1 = { idx: -1 }
    const lastObstacleJumped2 = { idx: -1 }

    function tryJump(blob: typeof blob1, pos: { inward: { x: number; y: number } }, obsIdx: number, lastJumped: { idx: number }) {
      if (!blob.isJumping && lastJumped.idx !== obsIdx) {
        blob.isJumping = true
        lastJumped.idx = obsIdx
        // Jump inward (over the obstacle toward content) to clear the block
        blob.jumpDir = { x: pos.inward.x, y: pos.inward.y }
        blob.jumpVel = -9.5
        blob.jumpDist = 0
      }
    }

    function checkJumps(blob: typeof blob1, lastJumped: { idx: number }) {
      const LOOK = 0.005 // Jump when very close to obstacle (was 0.022 = too early)
      const PASSED = 0.04 // Consider obstacle "passed" after this distance
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i]
        const diff = ((obs.t - blob.t) % 1 + 1) % 1
        // Reset cooldown for this obstacle once we've passed it
        if (lastJumped.idx === i && (diff > PASSED || diff < 0.001)) {
          lastJumped.idx = -1
        }
        if (diff < LOOK && diff > 0.0005) {
          const pos = getPosOnPath(blob.t)
          tryJump(blob, pos, i, lastJumped)
        }
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
        const alpha = fp.life * (isDark ? 0.4 : 0.3)
        ctxEl.fillStyle = isDark ? `rgba(180,200,255,${alpha})` : `rgba(255,220,210,${alpha})`
        ctxEl.beginPath()
        ctxEl.ellipse(0, 0, 3, 4, 0, 0, Math.PI * 2)
        ctxEl.fill()
        ctxEl.restore()
      }
    }

    function spawnDust(x: number, y: number) {
      for (let i = 0; i < 5; i++) {
        dust.push({ x, y, vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5, life: 1, r: 1.5 + Math.random() * 2 })
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
        ctxEl.fillStyle = isDark ? `rgba(180,200,255,${p.life * 0.35})` : `rgba(255,220,210,${p.life * 0.5})`
        ctxEl.fill()
      }
    }

    function drawBlob(
      x: number, y: number, jumpOffsetX: number, jumpOffsetY: number, angle: number,
      col: string, glowCol: string, lookBack: number, excited: boolean
    ) {
      const S = 22
      const s = S / 20
      const jumpMag = Math.hypot(jumpOffsetX, jumpOffsetY)
      const squash = excited ? 1.12 : 0.96 + Math.min(jumpMag * 0.015, 0.12)

      ctxEl.save()
      ctxEl.translate(x + jumpOffsetX, y + jumpOffsetY)
      ctxEl.rotate(angle + Math.PI / 2)

      if (isDark) {
        ctxEl.shadowBlur = 22
        ctxEl.shadowColor = glowCol
      }

      // Main blob body — soft ellipse, Studio Ghibli style
      ctxEl.fillStyle = col
      ctxEl.strokeStyle = isDark ? 'rgba(180,200,255,0.2)' : 'rgba(255,255,255,0.5)'
      ctxEl.lineWidth = 1
      ctxEl.beginPath()
      ctxEl.ellipse(0, 0, 12 * s, 14 * s * squash, 0, 0, Math.PI * 2)
      ctxEl.fill()
      ctxEl.stroke()

      // Eyes — simple, expressive
      ctxEl.fillStyle = isDark ? '#2a3545' : '#3d3a36'
      const eyeY = -4 * s
      const eyeSpacing = 5 * s
      const eyeScale = excited ? 1.2 : 1
      ctxEl.beginPath()
      ctxEl.ellipse(-eyeSpacing, eyeY, 2.5 * s * eyeScale, 3 * s * eyeScale, 0, 0, Math.PI * 2)
      ctxEl.ellipse(eyeSpacing, eyeY, 2.5 * s * eyeScale, 3 * s * eyeScale, 0, 0, Math.PI * 2)
      ctxEl.fill()

      // Blush — Ghibli touch
      ctxEl.fillStyle = isDark ? 'rgba(255,180,200,0.35)' : 'rgba(255,200,220,0.45)'
      ctxEl.beginPath()
      ctxEl.ellipse(-10 * s, 4 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2)
      ctxEl.ellipse(10 * s, 4 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2)
      ctxEl.fill()

      ctxEl.restore()
    }

    function drawObstacle(obs: { t: number; w: number; h: number }) {
      const pos = getPosOnPath(obs.t)
      ctxEl.save()
      ctxEl.translate(pos.x, pos.y)
      ctxEl.rotate(pos.angle + Math.PI / 2)
      ctxEl.fillStyle = isDark ? 'rgba(140,180,255,0.3)' : 'rgba(200,220,240,0.5)'
      ctxEl.strokeStyle = isDark ? 'rgba(160,200,255,0.5)' : 'rgba(180,200,220,0.6)'
      ctxEl.lineWidth = 1
      if (isDark) {
        ctxEl.shadowBlur = 6
        ctxEl.shadowColor = 'rgba(140,180,255,0.3)'
      }
      ctxEl.beginPath()
      roundRect(ctxEl, -obs.w / 2, -obs.h, obs.w, obs.h, 3)
      ctxEl.fill()
      ctxEl.stroke()
      ctxEl.shadowBlur = 0
      ctxEl.fillStyle = isDark ? 'rgba(200,220,255,0.2)' : 'rgba(255,255,255,0.5)'
      ctxEl.beginPath()
      roundRect(ctxEl, -obs.w / 4, -obs.h * 0.75, obs.w * 0.3, obs.h * 0.25, 1)
      ctxEl.fill()
      ctxEl.restore()
    }

    function handleCanvasClick(e: MouseEvent) {
      const mx = e.clientX
      const my = e.clientY
      const pos1 = getPosOnPath(blob1.t)
      const pos2 = getPosOnPath(blob2.t)
      const hit1 = Math.hypot(mx - pos1.x, my - pos1.y) < 28
      const hit2 = Math.hypot(mx - pos2.x, my - pos2.y) < 28

      if (hit1 || hit2) {
        const pos = hit1 ? pos1 : pos2
        const blob = hit1 ? blob1 : blob2

        blob.excited = true
        blob.lookBack = 1

        const sound = BLURB_SOUNDS[Math.floor(Math.random() * BLURB_SOUNDS.length)]
        roarBubbleEl.textContent = sound
        roarBubbleEl.style.left = pos.x - 60 + 'px'
        roarBubbleEl.style.top = pos.y - 60 + 'px'
        roarBubbleEl.classList.add('show')

        if (roarTimeout) clearTimeout(roarTimeout)
        roarTimeout = setTimeout(() => {
          roarBubbleEl.classList.remove('show')
          blob.excited = false
          setTimeout(() => {
            blob.lookBack = 0
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

      blob1.t += blob1.speed * dt * speedMult
      blob2.t += blob2.speed * dt * speedMult
      blob1.legPhase += 0.14 * speedMult
      blob2.legPhase += 0.14 * speedMult

      ;[blob1, blob2].forEach((b) => {
        if (b.isJumping) {
          b.jumpVel += 0.65
          b.jumpDist += b.jumpVel
          if (b.jumpDist >= 0) {
            b.jumpDist = 0
            b.jumpVel = 0
            b.isJumping = false
          }
        }
      })

      checkJumps(blob1, lastObstacleJumped1)
      checkJumps(blob2, lastObstacleJumped2)

      const pos1 = getPosOnPath(blob1.t)
      const pos2 = getPosOnPath(blob2.t)

      // Blob collision — when they run into each other, bounce apart
      collisionCooldown = Math.max(0, collisionCooldown - dt)
      const dist = Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y)
      const COLLISION_DIST = 48
      if (dist < COLLISION_DIST && dist > 1 && collisionCooldown <= 0) {
        collisionCooldown = 400
        const invDist = 1 / dist
        const dx1 = (pos1.x - pos2.x) * invDist
        const dy1 = (pos1.y - pos2.y) * invDist
        const dx2 = -dx1
        const dy2 = -dy1
        if (!blob1.isJumping) {
          blob1.isJumping = true
          blob1.jumpDir = { x: dx1, y: dy1 }
          blob1.jumpVel = -7
          blob1.jumpDist = 0
        }
        if (!blob2.isJumping) {
          blob2.isJumping = true
          blob2.jumpDir = { x: dx2, y: dy2 }
          blob2.jumpVel = -7
          blob2.jumpDist = 0
        }
        blob1.excited = true
        blob2.excited = true
        spawnDust(pos1.x, pos1.y)
        spawnDust(pos2.x, pos2.y)
        setTimeout(() => {
          blob1.excited = false
          blob2.excited = false
        }, 600)
      }

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

      const col1 = isDark ? 'rgba(255,250,245,0.95)' : 'rgba(255,248,240,0.98)'
      const col2 = isDark ? 'rgba(220,235,255,0.85)' : 'rgba(255,235,220,0.9)'
      const glow1 = isDark ? 'rgba(180,200,255,0.4)' : 'rgba(255,220,200,0.35)'
      const glow2 = isDark ? 'rgba(160,180,255,0.3)' : 'rgba(255,210,190,0.25)'

      drawBlob(pos2.x, pos2.y, blob2.jumpDir.x * blob2.jumpDist, blob2.jumpDir.y * blob2.jumpDist, pos2.angle, col2, glow2, blob2.lookBack, blob2.excited)
      drawBlob(pos1.x, pos1.y, blob1.jumpDir.x * blob1.jumpDist, blob1.jumpDir.y * blob1.jumpDist, pos1.angle, col1, glow1, blob1.lookBack, blob1.excited)

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
        Bloop!
      </div>
      <div className="dino-hint">Click a blob · Scroll to speed up</div>
    </>
  )
}
