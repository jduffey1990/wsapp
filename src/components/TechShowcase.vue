<template>
  <div class="showcase-wrap">
    <!-- Matrix background -->
    <canvas ref="matrixCanvas" class="matrix-canvas" aria-hidden="true"></canvas>

    <!-- Dark overlay for contrast -->
    <div class="backdrop"></div>

    <!-- Centered phrase -->
    <div class="centered">
      <Transition name="fade" mode="out-in">
        <div :key="currentPhrase" class="phrase glass">
          <span class="prompt">~/brandora $</span>
          <span class="text">{{ currentPhrase }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

/* ---------- Phrases (play once, then route) ---------- */
const phrases = [
  'scraping web-page information',
  'compiling product information',
  'building social media dossier',
  'hydrating Pinia stores',
  'invalidating caches (again)',
  'befriending the rate limiter',
  'warming up GPUs',
  'triangulating vibe metrics',
  'vectorizing your hunches',
  'emailing your mom to see if she can make our date later'
]
const index = ref(0)
const intervalMs = 2000
let phraseTimer = null

const currentPhrase = computed(() => phrases[index.value])

function playPhrasesOnceThenRoute() {
  stopPhraseLoop()
  phraseTimer = setInterval(() => {
    if (index.value < phrases.length - 1) {
      index.value++
    } else {
      // last phrase is on screen—give it a beat, then go
      stopPhraseLoop()
      setTimeout(() => router.push('/login'), 600)
    }
  }, intervalMs)
}
function stopPhraseLoop() {
  if (phraseTimer) {
    clearInterval(phraseTimer)
    phraseTimer = null
  }
}

/* ---------- Matrix background (canvas) ---------- */
const matrixCanvas = ref(null)
let ctx, width, height, fontSize, columns, drops
let animId = null
let lastTs = 0
const targetFps = 30
const frameInterval = 1000 / targetFps

const chars =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function initMatrix() {
  const canvas = matrixCanvas.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resizeCanvas()
  setupDrops()
  lastTs = 0
  animate(0)
  window.addEventListener('resize', onResize, { passive: true })
}
function setupDrops() {
  fontSize = 16
  columns = Math.floor(width / fontSize)
  drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50))
  ctx.font = `${fontSize}px monospace`
}
function onResize() {
  resizeCanvas()
  setupDrops()
}
function resizeCanvas() {
  width = matrixCanvas.value.width = window.innerWidth
  height = matrixCanvas.value.height = window.innerHeight
}
function animate(ts) {
  animId = requestAnimationFrame(animate)
  const delta = ts - lastTs
  if (delta < frameInterval) return
  lastTs = ts

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#00ff7f'
  for (let i = 0; i < columns; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length))
    const x = i * fontSize
    const y = drops[i] * fontSize
    ctx.fillText(char, x, y)
    if (y > height && Math.random() > 0.975) {
      drops[i] = Math.floor(Math.random() * -20)
    } else {
      drops[i]++
    }
  }
}

onMounted(() => {
  initMatrix()
  playPhrasesOnceThenRoute()
})
onBeforeUnmount(() => {
  stopPhraseLoop()
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.showcase-wrap { position: relative; width: 100%; height: 100vh; overflow: hidden; }
.matrix-canvas { position: absolute; inset: 0; z-index: 0; display: block; }
.backdrop { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0.35), rgba(0,0,0,0.75)); z-index: 1; }
.centered { position: relative; z-index: 2; height: 100%; display: grid; place-items: center; padding: 24px; text-align: center; }
.phrase { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: clamp(18px, 2.4vw, 28px); letter-spacing: 0.2px; line-height: 1.35; padding: 18px 22px; border-radius: 16px; display: inline-flex; align-items: center; gap: 10px; }
.prompt { opacity: 0.85; color: #8fcb9b; }
.text { color: #eef6ff; }
.glass { background: rgba(18, 19, 15, 0.35); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 8px 30px rgba(0,0,0,0.35); backdrop-filter: blur(4px); }
.fade-enter-active, .fade-leave-active { transition: opacity 300ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
