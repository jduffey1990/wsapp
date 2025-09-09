<template>
  <slot />

  <v-snackbar
    v-model="show"
    :color="color"
    location="top"
    :timeout="timeout"
  >
    <template #actions>
      <v-btn variant="text" @click="show = false">
        <v-icon icon="mdi-close-thick"></v-icon>
      </v-btn>
    </template>

    <template #text>
      <div v-html="message"></div>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const show = ref(false)
const message = ref('')
const color = ref('')
const timeout = ref(2000) // default to 5s

provide('toast', {
  show(options: { message: string; error?: boolean; timeout?: number }) {
    message.value = options.message
    color.value = options.error ? 'error' : 'success'
    timeout.value = options.timeout ?? 2000 // use provided timeout or default
    show.value = true
  },
})
</script>

