<template>
  <v-form @submit.prevent="loginUser">
    <v-text-field
      v-model="credentials.email"
      label="Email"
      type="text"
      autocomplete="email"
    />
    <UiPassword v-model="credentials.password" autocomplete="current-password" />

    <v-alert
      v-if="showInactiveAlert"
      type="warning"
      variant="tonal"
      class="mt-4"
      icon="mdi-email-alert-outline"
    >
      <div class="font-weight-medium mb-1">
        Your account isn’t activated yet
      </div>

      <div class="text-body-2 mb-3">
        We’ve already sent you an activation email.
        Please check your inbox and spam folder.
      </div>

      <div class="text-body-2 mb-3">
        Didn’t get it? You can resend the activation email below.
      </div>

      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="goToActivate"
        :disabled="!showInactiveAlert"
      >
        Resend activation email
      </v-btn>
    </v-alert>

    <div class="d-flex justify-end mt-4">
      <v-btn 
        type="submit" 
        color="primary" 
        :loading="loading"
        :disabled="showInactiveAlert"
      >
        Login
      </v-btn>
    </div>
  </v-form>
  
</template>

<script setup>
import UiPassword from '@/components/ui/Password.vue'
import { useUserStore } from '@/store/user'
import { computed, inject, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['success'])

const router = useRouter()
const { login } = useUserStore()
const showToast = inject('toast')?.show
const $users = inject('$usersApi')

const credentials = reactive({ email: '', password: '' })
const loading = ref(false)
const inactive = ref(false)
const showInactiveAlert = ref(false)

// Email validation

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailValid = computed(() => emailRegex.test(credentials.email));

// Watch inactive state and update alert visibility
watch(inactive, (newValue) => {
  showInactiveAlert.value = newValue
})

async function loginUser() {
  // Reset inactive state before attempting login
  inactive.value = false
  loading.value = true
  
  try {
    if(!emailValid){
      showToast?.({ 
        message: 'Please enter a valid email', 
        error: true 
      })
      return
    }

    await login(credentials)
    emit('success')
  } catch (error) {
    // Check if it's an inactive user error
    if (error.userInactive || error.response?.data?.error === 'USER_INACTIVE') {
      inactive.value = true
      showToast?.({ 
        message: error.message || error.response?.data?.message || 'Please verify your email to activate your account.', 
        error: true 
      })
      return
    }
    
    // Handle other errors
    const msg = error?.response?.data?.message || 'Login failed. Please try again.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

function goToActivate() {
  if (!emailValid.value) {
    showToast?.({
      message: 'Please enter a valid email',
      error: true,
    })
    return
  }

  router.push({
    name: 'Activate',
    query: {
      email: credentials.email.toLowerCase(),
    },
  })
}

async function resetPassword() {
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