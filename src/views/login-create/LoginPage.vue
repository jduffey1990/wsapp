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
            @cancel="showCreate = false"
          />
        </Transition>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          v-if="!showCreate"
          color="warning"
          @click="showCreate = true"
        >New Here?</v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script setup>
import { ref, inject } from 'vue'
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/store/user';
import { useRouter } from 'vue-router'
const { show } = inject('toast')
const {user} = storeToRefs(useUserStore());

import LoginForm from './LoginForm.vue'
import CreateAccountForm from './CreateAccountForm.vue'

const showCreate = ref(false)
const router = useRouter()

function onLoginSuccess () {
  // route to dashboard or where you want
  user.value = { ...user.value, email: 'loggedinuser@gmail.com' }
  show({ message: 'Login Successful! Redirecting...', error: false })
  setTimeout(() => router.push('/dashboard'), 2000)
}

function onCreated () {
  // toast is already shown inside child; then go back to login
  showCreate.value = false
}
</script>