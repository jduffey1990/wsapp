<template>
  <v-layout class="justify-center pa-4">
    <v-card width="600">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">
          {{ showCreate ? 'Create New User' : 'Login' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="showCreate"
          icon
          variant="text"
          @click="showCreate = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <Transition name="slide-y-transition" mode="out-in">
          <component
            :is="showCreate ? CreateAccountForm : LoginForm"
            @success="onLoginSuccess"
            @created="onCreated"
            @joined="onJoined"
            @cancel="showCreate = false"
          />
        </Transition>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          v-if="!showCreate"
          color="warning"
          @click="showCreate = true"
        >New User?</v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const { show } = inject('toast')
const {user} = storeToRefs(useUserStore());

import CreateAccountForm from './CreateAccountForm.vue';
import LoginForm from './LoginForm.vue';

const showCreate = ref(false)
const router = useRouter()

function onLoginSuccess() {
  if (!user.value?.id) {
    show({ message: 'Login error: Invalid user data', error: true })
    return
  }
  
  show({ message: 'Login Successful! Redirecting...', error: false })
  setTimeout(() => router.push('/dashboard'), 1000)
}

function onJoined () {
  // toast is already shown inside child; then go back to login
  showCreate.value = false
}

function onCreated () {
  // toast is already shown inside child; then go back to login
  showCreate.value = false
  router.push('/techShowcase')
}
</script>