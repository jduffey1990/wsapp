<template>
  <v-form @submit.prevent="loginUser">
    <v-text-field
      v-model="credentials.email"
      label="Email"
      type="text"
      autocomplete="email"
    />
    <UiPassword v-model="credentials.password" autocomplete="current-password" />

    <div class="d-flex justify-end mt-4">
      <v-btn type="submit" color="primary" :loading="loading">Login</v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { reactive, ref, inject } from 'vue'
import { useUserStore } from '@/store/user'
import UiPassword from '@/components/ui/Password.vue'

const emit = defineEmits(['success'])

const { login, loginDuped } = useUserStore()
const showToast = inject('toast')?.show
const $users = inject('$usersApi')

const credentials = reactive({ email: '', password: '' })
const loading = ref(false)

async function loginUser () {
  loading.value = true
  try {
    emit('success')
  } catch (error) {
    const msg = error?.response?.data?.message || 'Login failed. Please try again.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

async function resetPassword () {
  if (!credentials.email) {
    return showToast?.({ message: 'Please enter your email first.', error: true })
  }
  try {
    await $users.put('/reset-password/', { email: credentials.email })
    showToast?.({ message: 'Password reset! Please check your email.' })
  } catch {
    showToast?.({ message: 'Could not send reset email.', error: true })
  }
}
</script>

<style scoped>
.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-card {
  min-width: 600px;
}

.title-holder {
  display: flex;
  justify-content: space-between;
}


.match-field {
  margin-top: 20px; /* Adds space above the div */
  padding: 10px; /* Adds padding inside the div */
  background-color: #f8f9fa; /* Light grey background for better contrast */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack child elements vertically */
  gap: 10px; /* Space between each span */
}

.match-field span {
  display: flex; /* Enables flexbox layout within each span */
  align-items: center; /* Centers items vertically within each span */
  gap: 8px; /* Space between icon and text */
}

.green-span, .red-span {
  color: inherit; /* Ensures text color matches dynamic class */
  font-family: "halyard-text" !important;
  font-size: 14px; /* Slightly larger text for better readability */
  font-style: normal;
  font-weight: 400; /* Normal font weight */
  line-height: 1.4; /* Adjust line height for better readability */
}

.v-icon {
  font-size: 20px; /* Size of the icon */
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: grey;
  font-family: "halyard-text" !important;
  font-size: 30px;
  cursor: pointer;
  z-index: 100; /* Ensure button stays on top of other content */

}


@media (max-width: 700px) {
  .title-holder {
    max-height: 64px !important;

  }

  .title {
    margin-bottom: 80px;
  }
  .main-card {
  min-width: 90%;
}
}

</style>