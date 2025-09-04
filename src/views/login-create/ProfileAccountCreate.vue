<template>
  <v-alert v-if="!brand" type="warning" variant="outlined" class="mb-4">
    You must choose or create a brand first.
  </v-alert>

  <v-form @submit.prevent="submitNewClientDuped">
    <v-row class="mb-2">
      <v-col cols="12">
        <v-chip color="primary" variant="elevated" v-if="brand">
          Brand: {{ brand.name }}
        </v-chip>
      </v-col>
    </v-row>

    <v-text-field v-model="form.firstName" label="First Name" />
    <v-text-field v-model="form.lastName"  label="Last Name" />
    <v-text-field v-model="form.email"     label="Email" type="email" />
    <v-text-field v-model="form.username"  label="Username" />

    <v-text-field
      v-model="passwordOne"
      :type="showPass ? 'text' : 'password'"
      label="Enter New Password"
      :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="showPass = !showPass"
    />
    <v-text-field
      v-model="passwordTwo"
      :type="showPass ? 'text' : 'password'"
      label="Re-enter Password"
      :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="showPass = !showPass"
    />

    <div class="text-caption mt-2">
      <v-icon :color="rules.longerThan8 ? 'green' : 'red'">mdi-check-circle</v-icon> ≥ 9 chars
      <v-icon :color="rules.special ? 'green' : 'red'">mdi-check-circle</v-icon> special char
      <v-icon :color="rules.number ? 'green' : 'red'">mdi-check-circle</v-icon> number
      <v-icon :color="rules.mixed ? 'green' : 'red'">mdi-check-circle</v-icon> upper & lower
      <v-icon :color="rules.match ? 'green' : 'red'">mdi-check-circle</v-icon> match
    </div>

    <div class="d-flex justify-end mt-4 ga-2">
      <v-btn variant="text" @click="$emit('cancel')">Back</v-btn>
      <v-btn color="primary" type="submit" :disabled="!canSubmit || !brand" :loading="loading">
        Create Account
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { stringIsEmail } from '@/utils/string'


const props = defineProps({
  brand: {
    type: String,
    default: false
  },
  name: {
    type: String,
    default: 'Default Title'
  }
});

const emit = defineEmits(['created','cancel'])

const showToast = inject('toast')?.show
const $users = inject('$usersApi')

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: ''
})

const passwordOne = ref('')
const passwordTwo = ref('')
const showPass = ref(false)
const loading = ref(false)

const rules = reactive({
  longerThan8: false,
  special: false,
  number: false,
  mixed: false,
  match: false,
})

watch([passwordOne, passwordTwo], () => {
  const p = passwordOne.value
  rules.longerThan8 = p.length > 8
  rules.special     = /[!@#$%^&*(),.?":{}|<>]/.test(p)
  rules.number      = /\d/.test(p)
  rules.mixed       = /[a-z]/.test(p) && /[A-Z]/.test(p)
  rules.match       = passwordOne.value === passwordTwo.value
})

const clientReady = computed(() =>
  !!form.firstName && !!form.lastName && !!form.username && !!form.email
)
const passwordReady = computed(() =>
  rules.longerThan8 && rules.special && rules.number && rules.mixed && rules.match
)
const canSubmit = computed(() => clientReady.value && passwordReady.value)


async function submitNewClientDuped () {
  if (!props.brand) {
    return showToast?.({ message: 'Select or create a brand first.', error: true })
  }
  if (!clientReady.value) {
    return showToast?.({ message: 'Please fill out all required fields.', error: true })
  }
  if (!passwordReady.value) {
    return showToast?.({ message: 'Fix password requirements and try again.', error: true })
  }
  if (!stringIsEmail(form.email)) {
    return showToast?.({ message: 'Email format is invalid.', error: true })
  }

  form.email = form.email.toLowerCase()
  form.password = passwordOne.value

  loading.value = true
  try {
    // Fake wait to look like a request
    await new Promise(resolve => setTimeout(resolve, 800))

    // Always succeed
    showToast?.({ message: 'User created successfully! Redirecting to login…' })

    // let parent handle redirect or just do:
    emit('created')
    // or if you want a hard nav:
    // window.location.href = '/login'
  } finally {
    loading.value = false
  }
}

async function submitNewClient () {
  if (!props.brand) {
    return showToast?.({ message: 'Select or create a brand first.', error: true })
  }
  if (!clientReady.value) {
    return showToast?.({ message: 'Please fill out all required fields.', error: true })
  }
  if (!passwordReady.value) {
    return showToast?.({ message: 'Fix password requirements and try again.', error: true })
  }
  if (!stringIsEmail(form.email)) {
    return showToast?.({ message: 'Email format is invalid.', error: true })
  }

  form.email = form.email.toLowerCase()
  form.password = passwordOne.value

  try {
    loading.value = true
    // Attach brand id to payload – adjust field name to your API
    const res = await $users.post('/create-user', {
      ...form,
      name: `${form.firstName} ${form.lastName}`,
      brandId: props.brand.id
    })
    if (res.status === 201) {
      showToast?.({ message: 'Account created. Redirecting to login…' })
      emit('created')
    }
  } catch (error) {
    const msg = error?.response?.data?.error || 'Could not create account.'
    if (msg.includes('duplicate key value')) {
      showToast?.({ message: 'Username or email already exists.', error: true })
    } else {
      showToast?.({ message: msg, error: true })
    }
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>  </style>