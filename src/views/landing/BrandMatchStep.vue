<template>
  <div  ref = "pageEl" class="brandora page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <h1>Welcome, {{props.youPlural}}</h1>
        <p>We use brand + retailer data to match you with perfectly aligned {{ props.themPlural }}.</p>
        <div class="cta-row">
          <v-btn variant="flat" class="cta-btn" color="brand-primary" :to="{ name: 'Login' }">Get Started</v-btn>
          <v-btn variant="outlined" class="cta-outline" color="brand-success" @click="seeVideo()">See How It Works</v-btn>
        </div>
      </div>
    </section>

    <!-- A. Perfect-Match Retailers (Text L / Image R) -->
    <section ref="panelA" class="panel1" data-name="perfect">
        <div class="other-pin">
          <div class="copy">
            <h2 class="panel-title">Perfect-Match {{ props.themPlural }}</h2>
            <p class="panel-sub">
              Discover {{ props.themPlural.toLowerCase() }} aligned to your category, price point, audience, values, and so much more.
            </p>
          </div>

          <!-- Viewport-fixed flying image (independent of layout) -->
          <div ref="flyImg" class="fly-img" aria-hidden="true">
            <img
              src="https://brandora-jduffey.s3.us-east-2.amazonaws.com/tiles.png"
              alt=""
              class="fly-img-el"
            />
          </div>
        </div>
    </section>


    <!-- B. Objective Fit Scoring (Image L / Text R) -->
    <section ref="panelB" class="panel flip">
      <div class="pin">
        <div class="pin-inner">
          <div class="visual shine-visual">
            <img
              class="shine-img"
              src="https://brandora-jduffey.s3.us-east-2.amazonaws.com/radar.png"
              alt="Fit scoring radar"
            />
          </div>

          <div class="copy">
            <h2 class="panel-title">Objective Fit Scoring</h2>
            <p class="panel-sub">
              Our data cuts through bias to surface the highest-leverage {{ props.themSingular.toLowerCase() }} partners.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- C. Faster Wholesale Growth (Text L / Image R) -->
    <section ref="panelC" class="panel">
      <div class="pin">
        <div class="pin-inner2">
          <div class="copy">
            <h2 class="panel-title">Faster Wholesale Growth</h2>
            <p class="panel-sub">Focus your pipeline on {{props.themPlural}} where you’re most likely to move from feeling locked down to grabbing that cash.</p>
          </div>

          <div class="booth-visual" :class="swapClass">
            <!-- original -->
            <img
              class="booth-img img-orig"
              :class="{ active: boothState }"
              :src="BOOTH_ORIG"
              alt="Cash booth original"
              loading="eager"
            />
            <!-- locked -->
            <img
              class="booth-img img-locked"
              :class="{ active: !boothState }"
              :src="BOOTH_LOCKED"
              alt="Cash booth locked"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Scroll Hint (fixed) -->
    <transition name="fade">
      <div v-if="showScroll" class="scroll-hint" aria-hidden="true">
        <div class="hint-inner">
          <span class="hint-text">Scroll</span>
          <svg class="hint-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M12 19l-5-5M12 19l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </transition>

    
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useOverlayStore } from '@/store/overlay'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const overlayStore = useOverlayStore()
const userStore = useUserStore()
const router = useRouter()

function seeVideo () {
  overlayStore.openOverlay({
    title: 'How Brandora matches retailers with the right brands',
    text: '',
    mediaType: 'video',
    src: 'https://brandora-jduffey.s3.us-east-2.amazonaws.com/filler.mp4',
  })
}
function setRetailer () {
  userStore.setBusinessType('brand')
  router.push('/login')
}

const props = defineProps({
  youSingular: { type: String, required: true }, // e.g. "Brand" or "Retailer"
  themPlural:  { type: String, required: true },  // e.g. "Retailers" or "Brands"
  themSingular: {type:String, required: true},
  youPlural:  { type: String, required: true }
})

/* Scroll progress (0..1) per panel -> sets CSS var --p */
const showScroll = ref(true)
const panelA = ref(null)
const panelB = ref(null)
const panelC = ref(null)
const pageEl = ref(null)
const translateImage = ref(null)
const cashOverlay = ref(null)
const flyImg = ref(null)
let raf = 0

//Image swap logic
const BOOTH_ORIG   = 'https://brandora-jduffey.s3.us-east-2.amazonaws.com/Exciting+Cash+Grab+Challenge.png'
const BOOTH_LOCKED = 'https://brandora-jduffey.s3.us-east-2.amazonaws.com/locked.png'
let boothState= ref(false)
const swapClass  = ref('')              // adds a quick sheen on swap
let swapTimer= null
function triggerSwapFx(direction = 'fwd') {
  // add a class for ~600ms, then remove
  swapClass.value = direction === 'fwd' ? 'swap-forward' : 'swap-back';

  if (swapTimer !== null) {
    cancelAnimationFrame(swapTimer);
    swapTimer = null;
  }

  const t0 = performance.now();

  function run(now) {
    if (now - t0 > 620) {
      swapClass.value = '';
      swapTimer = null;
      return;
    }
    swapTimer = requestAnimationFrame(run);
  }

  swapTimer = requestAnimationFrame(run);
}


function updateProgress () {
  let pA = 0
  let pC = 0

  ;[panelA.value, panelB.value, panelC.value].filter(Boolean).forEach((el) => {
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const total = rect.height + vh
    const p = Math.min(1, Math.max(0, (vh - rect.top) / total))
    el.style.setProperty('--p', p.toFixed(4))
    if (el === panelA.value) pA = p
    if (el === panelC.value) pC = p
  })

  // page darken (unchanged)
  const vh = window.innerHeight
  const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
  const maxScroll = Math.max(1, docH - vh)
  const s = Math.min(1, Math.max(0, window.scrollY / maxScroll))
  const start = 0.05, end = 0.90
  const a = s
  if (pageEl.value) {
    pageEl.value.style.setProperty('--bgA', a.toFixed(3))
    let mark = s
    if(s < 0.7 && s > 0.4) mark = 0.7
    pageEl.value.style.setProperty('--textA', (mark * 255).toFixed(0))
  }

  // === Drive the FIXED flying image with panel A progress ===
  if (flyImg.value) {
    // travel from below the viewport to far above it; tweak to taste
    const startY = 350;   // vh (starts just below center)
    const endY   = -130; // vh (flies well off the top)
    const y = startY + (endY - startY) * pA;

    // Optional ease for nicer motion
    const ease = (t) => 1 - Math.pow(1 - t, 2);
    const yEased = startY + (endY - startY) * ease(pA);

    // Opacity gate: only visible while panel A is engaged
    const alpha = pA <= 0 || pA >= 1 ? 0 : 1;

    flyImg.value.style.setProperty('--flyY', `${yEased}vh`);
    flyImg.value.style.setProperty('--flyAlpha', alpha.toString());
  }

  // Drive overlay visibility + bill speed by panel C progress
  if (!boothState.value && pC > 0.65) {
    boothState.value = true
    triggerSwapFx('fwd')
  } else if (boothState.value && pC < 0.25) {
    boothState.value = false
    triggerSwapFx('back')
  }

  // disappear scroll piece
  const atTop = window.scrollY <= 1;      // tolerant vs exact 0
  showScroll.value = atTop;

  

  raf = requestAnimationFrame(updateProgress)
}

//Mounting the page
onMounted(() => {
  raf = requestAnimationFrame(updateProgress)
  window.addEventListener('resize', updateProgress, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', updateProgress)
})
</script>

<style scoped>
:root{
  --brand-primary:#5B9279;
  --brand-secondary:#12130F;
  --brand-info:#8FCB9B;
  --brand-warning:#D64933;
  --brand-success:#EEF36A;
}

.page{
  /* Start dim; JS will update --bgA as you scroll */
  --bgA: 0.0;
  --textA: 0;

  /* Base background + subtle radial lift + darkening overlay */
  background:
    linear-gradient(rgba(0,0,0,var(--bgA)), rgba(0,0,0,var(--bgA))),
    radial-gradient(1200px 800px at 50% -10%, rgba(255,255,255,0.08), transparent 90%),
    #e7eae4;
  color: rgb(var(--textA),var(--textA),var(--textA)) !important;
}

.page h1 {
  color: rgb(var(--textA),var(--textA),var(--textA)) !important;
}

.page p {
  color: rgb(var(--textA),var(--textA),var(--textA)) !important;
}

.page h2 {
  color: rgb(var(--textA),var(--textA),var(--textA)) !important;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Fixed hint bar */
.scroll-hint{
  position: fixed;
  inset: auto 0 14px 0;                /* bottom:14px, full width */
  transform: translateY(-5px);
  display: grid;
  place-items: center;
  pointer-events: none;                 /* don’t block clicks */
  z-index: 60;
}

/* Pill */
.hint-inner{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(0,0,0,.55);
  color: white;
  font-size: 14px;
  letter-spacing: .3px;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
}

/* Arrow bounce */
.hint-arrow{
  animation: bounce 1.2s ease-in-out infinite;
}
@keyframes bounce{
  0%,100% { transform: translateY(0);   opacity: .9; }
  50%     { transform: translateY(4px); opacity: 1;  }
}

/* Optional: subtle gradient floor so it pops on light backgrounds */
.scroll-hint::before{
  content:"";
  position: absolute;
  inset: -24px 0 0 0;
  background: linear-gradient(to top, rgba(0,0,0,.12), transparent);
  pointer-events: none;
  border-radius: 0;
}

/* HERO */
.hero{
  min-height:72vh;
  display:grid;
  place-items:center;
  text-align:center;
  padding:4rem 1rem 2rem;
}
.hero-inner h1{
  font-size:clamp(2.2rem,3.6vw,4rem);
  font-weight:800;
}
.hero-inner p{
  max-width:700px; margin:.75rem auto 1.5rem; opacity:.8;
}
.cta-row{ display:flex; gap:.75rem; justify-content:center; }

/* PANELS */
.panel1{
  --p:0;
  display: flex;

  position:relative;
  height:50vh;        /* scroll stage per panel */
  padding-inline:clamp(0px,5vw);
}
.panel{
  --p:0;
  position:relative;
  height:200vh;        /* scroll stage per panel */
  padding-inline:clamp(16px,5vw,64px);
}
.pin{
  position:sticky; top:0;
  min-height:100vh; display:grid; align-items:center;
}

/* Two-column layout for this panel */
.other-pin{
  max-width: min(1200px, 92vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(28px, 6vw, 120px);
  align-items: center;
  padding-block: clamp(24px, 6vh, 72px);
}
.panel.flip .other-pin{ grid-template-columns: 0.95fr 1.05fr; }
.pin-inner{
  /* 2-col with generous negative space */
  display: flex;
  flex-direction: row;;
  max-width:min(1200px, 92vw);
  margin:0 auto;
  display:grid;
  grid-template-columns: 1.05fr 0.95fr;  /* slight text bias */
  gap:clamp(28px,6vw,120px);
  align-items:center;
  padding-block:clamp(24px,6vh,72px);
}

.panel.flip .pin-inner{ grid-template-columns: 0.95fr 1.05fr; }
.panel.flip .copy{ order:2; }
.panel.flip .visual{ order:1; }

.copy{
  /* keep text narrow for elegance */
  max-width: 56ch;
}
.panel-title{
  font-size:clamp(1.6rem,2.6vw,2.3rem);
  font-weight:800;
  margin:0 0 .25rem 0;
}
.panel-sub{
  font-size:clamp(1rem,1.2vw,1.1rem);
  opacity:.9;
}

/* Visuals: smaller vs viewport, centered on mobile */
.visual{
  justify-self:center;
  width:clamp(260px, 38vw, 520px);   /* key: smaller, tasteful */
  aspect-ratio: 4 / 3;
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 10px 40px rgba(0,0,0,.12);
  background:#fff;
  position:relative;
}

.fly-img{
  --flyY: 0vh;
  --flyAlpha: 0;

  /* position: fixed; */
  inset: 0;                   /* we’ll center with transform */
  pointer-events: none;       /* don’t block clicks below */
  z-index: 40;                /* above content but below any sticky nav you want */
  display: grid;
  place-items: center;        /* centers child before transform */
  opacity: var(--flyAlpha);
  transition: opacity 120ms linear; /* quick pop in/out at edges */
  transform: translateX(10%); /* center horizontally */
  mix-blend-mode: multiply;
}

.fly-img-el{
  height: 70vh;              /* show the FULL image height */
  width: auto;                /* preserve aspect ratio */
  transform: translate(-50%, var(--flyY));
  position: absolute;
  left: 50%; top: 0;          /* center horizontally, start at top */
  will-change: transform;
  /* optional polish */
  filter: saturate(1.05) contrast(1.02) brightness(1.03);
}

/* B. Shine sweep */
.shine-visual{ background:#0f0f0f; display:grid; place-items:center; }
.shine-img{ width:100%; height:100%; object-fit:contain; padding:clamp(8px,2vw,16px); }
.shine-visual::after{
  content:""; position:absolute; inset:-30% -70%;
  background:linear-gradient(105deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,.08) 44%,
    rgba(255,255,255,.25) 50%,
    rgba(255,255,255,.08) 56%,
    rgba(255,255,255,0) 100%);
  transform: translateX(calc(-60% + (var(--p)*120%))) rotate(-8deg);
  mix-blend-mode:screen; pointer-events:none; will-change:transform;
}

/* C. Cash booth */
.pin-inner2{
  display: flex;
  flex-direction: row;
  max-width:min(1200px, 92vw);
  margin:0 auto;
  display:grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap:clamp(28px,6vw,120px);
  align-items:center;
  padding-block:clamp(24px,6vh,72px);
}

/* === Viewport-fixed overlay === */

.booth-visual{
  position: relative;
  justify-self: center;
  display: grid;
  place-items: center;
  overflow: visible;
  /* give it some height so the absolute child has a box to center in */
  min-height: clamp(360px, 60vh, 600px);
}



.booth-img{
  position: absolute;

  /* center perfectly in both axes */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(.985);

  max-height: 600px;
  width: auto;
  opacity: 0;
  filter: blur(2px) saturate(1.02) contrast(1.02);
  transition:
    opacity .44s ease,
    transform .44s ease,
    filter .44s ease;
  will-change: opacity, transform, filter;
}
.booth-img.active{
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  filter: blur(0) saturate(1.02) contrast(1.02);
}

/* --- Optional: quick sheen wipe on each swap --- */
.booth-visual.swap-forward::after,
.booth-visual.swap-back::after{
  content: "";
  position: absolute;
  inset: -15% -40%;
  pointer-events: none;
  background: linear-gradient(105deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,.18) 48%,
    rgba(255,255,255,0) 60%);
  mix-blend-mode: screen;
  animation: sheen .6s ease forwards;
}
.booth-visual.swap-back::after{
  animation-direction: reverse;
}

@keyframes sheen{
  from { transform: translateX(-60%) rotate(-8deg); opacity: .0; }
  10%  { opacity: .9; }
  to   { transform: translateX(60%) rotate(-8deg); opacity: 0; }
}

/* Mobile */
@media (max-width: 900px){
  .pin-inner{
    flex-direction: column;
    gap:clamp(20px,5vh,36px);
  }
  .copy{ justify-self:center; text-align:center; }
  .visual{ width:min(78vw, 420px); aspect-ratio:auto; }

  .fly-img-el{
    height: 86vh;
  }
  .booth-img{ max-height: 56vh; }
}
</style>
