<template>
  <v-layout class="justify-center align-start pa-4" style="min-height: 100vh;">
    <v-card width="500px" class="activation-card">
      <v-toolbar class="title-holder" :color="activationState.color">
        <v-toolbar-title class="title">{{ activationState.title }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-8">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <p class="text-h6">One moment please...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="text-center">
          <v-icon color="success" size="80" class="mb-4">mdi-check-circle</v-icon>
          <p class="text-h5 mb-2">Account Activated!</p>
          <p class="text-body-1 mb-4">Your account has been successfully activated.</p>
          <p class="text-body-2 text-grey mb-6">You can now log in and start using your account.</p>
          
          <v-btn
            color="primary"
            size="large"
            @click="goToLogin"
            class="mt-2"
          >
            Go to Login
          </v-btn>
        </div>

        <!-- No Token State (Manual Navigation) -->
        <div v-else-if="isNoToken" class="text-center">
          <v-icon color="warning" size="80" class="mb-4">mdi-email-outline</v-icon>
          <p class="text-h5 mb-2">Activate Your Account</p>
          <p class="text-body-1 mb-4">To activate your account, please verify/enter your email below</p>
          
          <v-card-text class="pa-6">
            <v-text-field
              v-model="resendEmail"
              label="Email Address"
              type="email"
              variant="outlined"
              :error-messages="resendEmailError"
              @keyup.enter="sendNewActivation"
            ></v-text-field>
          </v-card-text>

          <p
            v-if="emailFromQuery"
            class="text-caption text-grey mt-2"
          >
            This email was pre-filled from your login attempt.
          </p>


          <div class="button-section">
            <v-btn
              color="primary"
              variant="outlined"
              @click="sendNewActivation"
              class="mb-2"
              :disabled="!canResend"
              :loading="resendLoading"
            >
              Request New Activation Link
            </v-btn>
            <v-btn
              color="grey"
              variant="text"
              @click="goToLogin"
            >
              Back to Login
            </v-btn>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="text-center">
          <v-icon color="error" size="80" class="mb-4">mdi-alert-circle</v-icon>
          <p class="text-h5 mb-2">Activation Failed</p>
          <p class="text-body-1 mb-4">{{ errorMessage }}</p>
          
          <div class="error-details pa-4 mb-4">
            <p class="text-body-2 text-grey mb-2">This could be because:</p>
            <ul class="text-left text-body-2 text-grey">
              <li>The activation link has expired (links are valid for 24 hours)</li>
              <li>The activation link has already been used</li>
              <li>You clicked an older link in an email thread with multiple invitations</li>
              <li>The activation link is invalid or corrupted</li>
            </ul>
          </div>

          <div class="button-section">
            
            <v-btn
              color="grey"
              variant="text"
              @click="goToLogin"
            >
              Back to Login
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import { stringIsEmail } from '@/utils/string';
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { show } = inject('toast');
const $users = inject('$usersApi');

const props = defineProps({
    token: String
});

const emailFromQuery = computed(() => {
  const email = route.query.email
  return typeof email === 'string' && stringIsEmail(email)
    ? email.toLowerCase()
    : ''
})


// State management
const isLoading = ref(false);
const isSuccess = ref(false);
const isError = ref(false);
const isNoToken = ref(false);
const errorMessage = ref('');

// Resend dialog
const resendEmail = ref(''); // if email in params, set equal.  Else ''
const resendEmailError = ref('');
const resendLoading = ref(false);
const canResend = computed(() => {
  return stringIsEmail(resendEmail.value) && !resendLoading.value
})

// Get token from route params
const token = computed(() => {
    return String(props.token || '').toLowerCase();
});

// Dynamic state for toolbar
const activationState = computed(() => {
  if (isLoading.value) {
    return { title: 'Activating Account', color: 'primary' };
  } else if (isSuccess.value) {
    return { title: 'Success!', color: 'success' };
  } else if (isNoToken.value) {
    return { title: 'Account Activation', color: 'warning' };
  } else {
    return { title: 'Activation Error', color: 'error' };
  }
});

// Activate account on mount
onMounted(async () => {
  // If email was passed from login, prefill it
  if (emailFromQuery.value) {
    resendEmail.value = emailFromQuery.value
  }

  // Check if there's a token
  if (!token.value || token.value === 'undefined') {
    // No token provided - show the "send activation email" state
    isNoToken.value = true;
    return;
  }
  
  // Token provided - attempt activation
  await activateAccount();
});

const activateAccount = async () => {
  try {
    isLoading.value = true;
    const response = await $users.post(`/activate/${token.value}`);
    
    if (response.data.success) {
      isSuccess.value = true;
      show({
        message: 'Your account has been successfully activated!',
      });
    }
  } catch (error) {
    console.error('Activation error:', error);
    isError.value = true;
    
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = 'An unexpected error occurred during activation.';
    }
    
    show({
      message: errorMessage.value,
      error: true,
    });
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push({ name: 'Login' });
};

const sendNewActivation = async () => {
  // Validate email
  resendEmailError.value = '';
  
  if (!resendEmail.value) {
    resendEmailError.value = 'Email is required';
    return;
  }
  
  if (!stringIsEmail(resendEmail.value)) {
    resendEmailError.value = 'Please enter a valid email address';
    return;
  }

  try {
    resendLoading.value = true;
    const email = resendEmail.value.toLowerCase();
    const response = await $users.post(`/resend-activation/${email}`);
    
    if (response.data.success) {
      show({
        message: 'A new activation link has been sent to your email.',
      });
      
      // Show success message and option to go to login
      isNoToken.value = false;
      isSuccess.value = false;
      isError.value = false;
      
      // Optionally redirect to login after a delay
      setTimeout(() => {
        goToLogin();
      }, 3000);
    }
  } catch (error) {
    console.error('Resend activation error:', error);
    
    if (error.response && error.response.data && error.response.data.error) {
      show({
        message: error.response.data.error,
        error: true,
      });
    } else {
      show({
        message: 'Failed to send activation link. Please try again.',
        error: true,
      });
    }
  } finally {
    resendLoading.value = false;
  }
};
</script>

<style scoped>
.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.activation-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title-holder {
  display: flex;
  justify-content: center;
}

.title {
  font-family: "halyard-text" !important;
  font-weight: 600;
}

.error-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff5252;
}

.error-details ul {
  list-style-position: inside;
  padding-left: 0;
}

.error-details li {
  margin-bottom: 8px;
}

.info-box {
  background-color: #fff3cd;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

@media (max-width: 700px) {
  .activation-card {
    width: 90% !important;
  }
  
  .title-holder {
    max-height: 64px !important;
  }
}
</style>