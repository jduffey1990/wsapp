// stores/overlay.js
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useOverlayStore = defineStore('overlay', () => {
  const showOverlay = ref(false)
  const overlayContent = ref({
    title: '',
    text: '',
    mediaType: 'image',        // 'image' | 'video'
    src: ''                    // image url OR video url
  })

  function openOverlay({ title = '', text = '', mediaType = 'image', src = '' } = {}) {
    overlayContent.value = { title, text, mediaType, src }
    showOverlay.value = true
  }

  function closeOverlay() {
    showOverlay.value = false
  }

  return { showOverlay, overlayContent, openOverlay, closeOverlay }
})
