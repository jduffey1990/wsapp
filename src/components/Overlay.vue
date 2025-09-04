<!-- src/components/Overlay.vue -->
<template>
  <div class="overlay">
    <div class="overlay-content">
      <button class="close-button" @click="closeOverlay"><v-icon>mdi-close</v-icon></button>

      <h2 class="overlay-title-static">{{ title }}</h2>

      <template v-if="mediaTypeComputed === 'video'">
        <!-- v-responsive gives the player a reliable box -->
        <v-responsive class="media-box" aspect-ratio="16 / 9">
          <v-video
            :src="srcComputed"
            controls
            eager
          />
        </v-responsive>
      </template>
      <template v-else>
        <img :src="srcComputed" alt="Overlay Image" class="overlay-media" />
      </template>

      <p class="overlay-text-static">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue' 

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Default Title' },
  text: { type: String, default: 'Default Text' },

  /* New props */
  mediaType: { type: String, default: '' },        // 'video' | 'image' | ''
  src: { type: String, default: '' },

  /* Back-compat props */
  backgroundImage: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const srcComputed = computed(() => {
  // prefer new `src`, fallback to legacy `backgroundImage`
  console.log('Computed src:', props.src || props.backgroundImage || '')
  return props.src || props.backgroundImage || ''
})

const mediaTypeComputed = computed(() => {
  if (props.mediaType) return props.mediaType
  // infer from extension if not explicitly set
  const path = srcComputed.value.toLowerCase()
  return path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.webm')
    ? 'video'
    : 'image'
})

function closeOverlay() {
  emit('close')
}
</script>

<style scoped>
/* Overlay.vue (style) */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.8);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}

.overlay-content {
  position: relative;
  background: #fff;
  padding: 24px;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0,0,0,.2);
  border-radius: 12px;
  width: min(96vw, 1200px);   /* wider */
  max-height: 92vh;           /* taller */
  overflow: auto;             /* allow scroll if text is long */
}

/* Allow the player to be large */
.media-box {
  width: 100%;
  max-height: 70vh;   /* keeps room for title/close */
  border-radius: 12px;
  overflow: hidden;
}

/* Video-friendly image class (no opacity overlay here) */
.overlay-media {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

/* Make title/text part of the normal flow so they don't sit on top of media */
.overlay-title-static {
  margin: 8px 48px 16px 0; /* leave room for the close button */
  color: #07152A;
  font-size: 24px;
  font-weight: 700;
}

.overlay-text-static {
  margin-top: 16px;
  color: #07152A;
  font-size: 16px;
  line-height: 1.5;
}

.close-button {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: #666; font-size: 20px; cursor: pointer;
}

@media (max-width: 700px) {
  .overlay-content { width: 100vw; height: 100vh; border-radius: 0; }
  .media-box { max-height: 60vh; }
  .overlay-title-static { font-size: 20px; }
  .overlay-text-static { font-size: 14px; }
}

</style>