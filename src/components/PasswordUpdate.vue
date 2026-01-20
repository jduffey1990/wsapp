<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <!-- Header -->
          <v-card-title class="text-h5 text-center mb-4">
            {{ hasToken ? 'Reset Your Password' : 'Forgot Password?' }}
          </v-card-title>

          <v-card-subtitle class="text-center mb-4" v-if="!hasToken">
            Enter your email and we'll send you a password reset link
          </v-card-subtitle>

          <!-- REQUEST RESET (no token) -->
          <v-form v-if="!hasToken" @submit.prevent="requestPasswordReset">
            <v-text-field
              v-model.trim="email"
              label="Email"
              type="email"
              :rules="[emailRequired, emailFormat]"
              autocomplete="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
            />

            <div class="d-flex justify-space-between align-center mt-4">
              <v-btn
                variant="text"
                :to="{ name: 'Login' }"
                :disabled="loading"
              >
                Back to Login
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!email || loading"
              >
                Send Reset Link
              </v-btn>
            </div>
          </v-form>

          <!-- RESET PASSWORD (with token) -->
          <v-form v-else @submit.prevent="resetPassword">
            <!-- Token Verification Status -->
            <v-alert
              v-if="verifyingToken"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              Verifying your reset link...
            </v-alert>

            <v-alert
              v-if="tokenInvalid"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              <div class="font-weight-medium mb-1">Invalid or Expired Link</div>
              <div class="text-body-2">
                This password reset link is invalid or has expired.
                Please request a new one.
              </div>
            </v-alert>

            <template v-if="!verifyingToken && !tokenInvalid">
              <v-text-field
                v-model.trim="tokenEmail"
                label="Email"
                type="email"
                disabled
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-2"
              />

              <v-text-field
                v-model.trim="passwordOne"
                :type="showPass ? 'text' : 'password'"
                label="New Password"
                variant="outlined"
                :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPass = !showPass"
                prepend-inner-icon="mdi-lock"
              />

              <v-text-field
                v-model.trim="passwordTwo"
                :type="showPass ? 'text' : 'password'"
                label="Confirm New Password"
                variant="outlined"
                :append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPass = !showPass"
                prepend-inner-icon="mdi-lock"
              />

              <!-- Password validation indicators -->
              <div class="text-caption mt-2 mb-4">
                <div class="d-flex align-center mb-1">
                  <v-icon 
                    :color="rules.longerThan8 ? 'green' : 'red'" 
                    size="small"
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span>At least 9 characters</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon 
                    :color="rules.special ? 'green' : 'red'" 
                    size="small"
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span>Contains special character</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon 
                    :color="rules.number ? 'green' : 'red'" 
                    size="small"
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span>Contains number</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon 
                    :color="rules.mixed ? 'green' : 'red'" 
                    size="small"
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span>Contains uppercase and lowercase</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon 
                    :color="rules.match ? 'green' : 'red'" 
                    size="small"
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span>Passwords match</span>
                </div>
              </div>

              <div class="d-flex justify-space-between align-center mt-4">
                <v-btn
                  variant="text"
                  :to="{ name: 'Login' }"
                  :disabled="loading"
                >
                  Back to Login
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disabled="!passwordValid || loading"
                >
                  Reset Password
                </v-btn>
              </div>
            </template>

            <!-- If token is invalid, show request new link button -->
            <div v-if="tokenInvalid" class="d-flex justify-center mt-4">
              <v-btn
                color="primary"
                variant="outlined"
                @click="clearTokenAndRequestNew"
              >
                Request New Reset Link
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showToast = inject('toast')?.show
const $users = inject('$usersApi')

// State
const loading = ref(false)
const verifyingToken = ref(false)
const tokenInvalid = ref(false)

// For requesting reset
const email = ref('')

// For resetting with token
const token = ref('')
const tokenEmail = ref('')
const passwordOne = ref('')
const passwordTwo = ref('')
const showPass = ref(false)

// Password validation rules
const rules = reactive({
  longerThan8: false,
  special: false,
  number: false,
  mixed: false,
  match: false,
})

// Email validation
const emailRequired = v => !!v || 'Email is required'
const emailFormat = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email'

// Computed
const hasToken = computed(() => !!token.value)
const passwordValid = computed(() => 
  rules.longerThan8 && rules.special && rules.number && rules.mixed && rules.match
)

// Watch password changes to update validation rules
watch([passwordOne, passwordTwo], () => {
  const p = passwordOne.value || ''
  rules.longerThan8 = p.length > 8
  rules.special = /[!@#$%^&*(),.?":{}|<>]/.test(p)
  rules.number = /\d/.test(p)
  rules.mixed = /[a-z]/.test(p) && /[A-Z]/.test(p)
  rules.match = passwordOne.value === passwordTwo.value && passwordOne.value !== ''
}, { immediate: true })

// Verify token on mount if present
onMounted(async () => {
  const urlToken = route.query.token
  if (urlToken) {
    token.value = urlToken
    await verifyToken(urlToken)
  }
})

/**
 * Verify if the reset token is valid
 */
async function verifyToken(tokenValue) {
  verifyingToken.value = true
  tokenInvalid.value = false

  try {
    const response = await $users.get(`/verify-reset-token/${tokenValue}`)
    
    if (response.data.valid) {
      tokenEmail.value = response.data.email
    } else {
      tokenInvalid.value = true
      showToast?.({
        message: 'This password reset link is invalid or expired',
        error: true
      })
    }
  } catch (error) {
    tokenInvalid.value = true
    const msg = error?.response?.data?.error || 'Invalid reset link'
    showToast?.({
      message: msg,
      error: true
    })
  } finally {
    verifyingToken.value = false
  }
}

/**
 * Request a password reset email
 */
async function requestPasswordReset() {
  if (!email.value) return

  loading.value = true
  try {
    await $users.post('/request-password-reset', {
      email: email.value.toLowerCase()
    })

    showToast?.({
      message: 'If an account exists with this email, a password reset link has been sent.',
      timeout: 6000
    })

    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 3000)

  } catch (error) {
    const msg = error?.response?.data?.error || 'Failed to send reset email'
    showToast?.({
      message: msg,
      error: true
    })
  } finally {
    loading.value = false
  }
}

/**
 * Reset password with token
 */
async function resetPassword() {
  if (!passwordValid.value || !token.value) return

  loading.value = true
  try {
    await $users.post('/reset-password', {
      token: token.value,
      newPassword: passwordOne.value
    })

    showToast?.({
      message: 'Password reset successfully! You can now log in with your new password.',
      timeout: 5000
    })

    // Redirect to login
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)

  } catch (error) {
    const msg = error?.response?.data?.error || 'Failed to reset password'
    showToast?.({
      message: msg,
      error: true
    })
  } finally {
    loading.value = false
  }
}

/**
 * Clear token and show email input to request new reset
 */
function clearTokenAndRequestNew() {
  token.value = ''
  tokenEmail.value = ''
  tokenInvalid.value = false
  email.value = ''
  passwordOne.value = ''
  passwordTwo.value = ''
  
  // Remove token from URL
  router.replace({ query: {} })
}
</script>

<style scoped>
.text-caption {
  line-height: 1.6;
}
</style>