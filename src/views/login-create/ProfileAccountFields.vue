<!-- ProfileAccountFields.vue -->
<template>

  <!-- Just the fields; NO v-form here -->
  <v-text-field v-model="local.firstName" label="First Name"/>
  <v-text-field v-model="local.lastName"  label="Last Name" />
  <v-text-field
    v-model="local.email"
    label="Email"
    type="email"
    :rules="[emailRequired, emailFormat, emailDomain]"
    persistent-hint
  />

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
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { stringIsEmail } from '@/utils/string'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }),
  },
  disabled: {
    type: Boolean,
    default: false
  }, 
  isValid: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'valid'])

const local = reactive({ ...props.modelValue })
watch(() => props.modelValue, v => Object.assign(local, v || {}), { deep: true })

const passwordOne = ref('')
const passwordTwo = ref('')
const showPass = ref(false)

//password rules
const rules = reactive({
  longerThan8: false,
  special: false,
  number: false,
  mixed: false,
  match: false,
})

//email validation script
const emailRequired = v => !!v || 'Email is required.'
const emailFormat   = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email.'
const emailDomain   = v => !v || /@ddd\.com$/i.test(v) || 'Email must be @ddd.com'

function same(a, b) {
  if (!a || !b) return false
  return a.firstName === b.firstName &&
         a.lastName  === b.lastName  &&
         a.email     === b.email     &&
         a.password  === b.password
}

const clientReady = computed(() =>
  !!local.firstName && !!local.lastName && !!local.email
)
const passwordReady = computed(() =>
  rules.longerThan8 && rules.special && rules.number && rules.mixed && rules.match
)
const emailOK = computed(() => stringIsEmail(local.email || ''))

const isValid = computed(() => clientReady.value && passwordReady.value && emailOK.value)

function emitModelAndValidity () {
  const payload = { ...local, email: (local.email || '').toLowerCase() }
  // only emit if something actually changed
  if (!same(payload, props.modelValue)) {
    emit('update:modelValue', payload)
  }
  emit('valid', isValid.value)
}

// Optional: expose an imperative validate() for submit-time checks
defineExpose({
  validate: () => isValid.value,
  getPayload: () => ({ ...local, email: (local.email || '').toLowerCase() })
})

//watches
watch(local, emitModelAndValidity, { deep: true })

watch([passwordOne, passwordTwo], () => {
  const p = passwordOne.value || ''
  rules.longerThan8 = p.length > 8
  rules.special     = /[!@#$%^&*(),.?":{}|<>]/.test(p)
  rules.number      = /\d/.test(p)
  rules.mixed       = /[a-z]/.test(p) && /[A-Z]/.test(p)
  rules.match       = passwordOne.value === passwordTwo.value
  local.password    = rules.match ? passwordOne.value : ''
  emitModelAndValidity()
}, { immediate: true })
</script>
