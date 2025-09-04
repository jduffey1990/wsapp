<template>
  <div class="whole-div">
    <div class="left-col">
      <v-img
        src="@/assets/casterbuster.png"
        size="400px"
      ></v-img>
    </div>
    <div class="side-column">
      <v-btn  v-if="!buttonHid" @click="finishTyping" class="mb-6">
        Finish Monologue
      </v-btn>
      <p class="typewriter-text">
        {{ visibleText }}
      </p>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  
  const props = defineProps({
    fullText: {
      type: String,
      default: ''
    },
    typeSpeed: {
      type: Number,
      default: 20 // ms between characters
    }
  })
  
  const visibleText = ref('')
  let typingTimer = null
  const buttonHid = ref(false)
  
  // Re-type if the parent passes a new fullText
  watch(
    () => props.fullText,
    () => {
      startTyping()
    }
  )
  
  // Also run on mount (initial text)
  onMounted(() => {
    startTyping()
  })
  
  function startTyping() {
  clearInterval(typingTimer)
  visibleText.value = ''
  let index = 0

  typingTimer = setInterval(() => {
    if (index < props.fullText.length) {
      visibleText.value += props.fullText[index]
      index++
    } else {
      clearInterval(typingTimer)
    }
  }, props.typeSpeed)
}

function finishTyping() {
  visibleText.value = props.fullText
  clearInterval(typingTimer)
  buttonHid.value = true
}
  </script>
  
  <style scoped>
.whole-div {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Default for wider screens: image 1/3, side column 2/3 */
.left-col {
  width:300px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-column {
  width: 67%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Under 700px: stack columns in one centered column */
@media screen and (max-width: 700px) {
  .whole-div {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .left-col,
  .side-column {
    width: 60%;
    padding: 0;
  }

  .left-col {
    margin-bottom: 1rem; /* spacing between the image and the button */
  }
}

/* Typewriter text styling */
.typewriter-text {
  white-space: pre-line; /* preserves line breaks from multiline text */
  font-family: 'Arial', sans-serif;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.3) !important;
  padding: 0 10px;
}

.typewriter-text b {
  font-size: 30px;
}
</style>







  