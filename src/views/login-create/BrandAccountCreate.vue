<template>
  <v-form @submit.prevent='onSubmit'>
    <!-- Tabs -->
    <v-tabs v-model="tab" align-tabs="center" class="mb-4">
      <v-tab value="join">Enter Access Code</v-tab>
      <v-tab value="create">Create a New Brand</v-tab>
    </v-tabs>

    <!-- Tab content -->
    <v-window v-model="tab">
      <!-- JOIN EXISTING BRAND -->
      <v-window-item value="join">
        <v-text-field
          v-model.trim="passcode"
          label="Brand Passcode"
          hint="Paste the code your team shared with you"
          persistent-hint
          required
        />

        <br />
        <br />


        <!-- Just the fields; NO v-form here -->
        <v-text-field v-model.trim="accountForm.firstName" label="First Name"/>
        <v-text-field v-model.trim="accountForm.lastName"  label="Last Name" />
        <v-text-field
          v-model.trim="accountForm.email"
          label="Email"
          type="email"
          :rules="[emailRequired, emailFormat]"
          persistent-hint
        />

        <v-text-field
          v-model.trim="passwordOne"
          :type="showPass ? 'text' : 'password'"
          label="Enter New Password"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPass = !showPass"
        />
        <v-text-field
          v-model.trim="passwordTwo"
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
      
        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="loading" :disabled="!canJoin">
            Join Brand
          </v-btn>
        </div>
      </v-window-item>

      <!-- CREATE NEW BRAND -->
      <v-window-item value="create">
        <v-text-field v-model.trim="brandForm.name" label="Brand Name" required />

        <!-- New: optional verification method + dynamic field -->
        <v-select
          v-model="verify.method"
          :items="verify.methodOptions"
          label="(Optional) Choose a verification method"
          hint="Add one helpful signal for faster verification"
          persistent-hint
          class="mt-2"
          clearable
        />

        <v-expand-transition>
          <div v-if="verify.method" class="mt-2">
            <!-- Business website URL -->
            <v-text-field
              v-if="verify.method === 'website'"
              v-model.trim="verify.payload.website"
              label="Business website URL"
              type="url"
              placeholder="https://brand.com"
              :rules="[rulesUrl.url]"
              persistent-hint
              hint="Tip: Use your main landing page"
            />

            <!-- Headquarters address (freeform for now) -->
            <v-text-field
              v-else-if="verify.method === 'address'"
              v-model.trim="verify.payload.address"
              label="Headquarters address"
              placeholder="123 Main St, City, ST 00000"
              persistent-hint
              hint="We’ll attempt a quick lookup preview"
            />

            <!-- Linkedin handle -->
             <v-text-field
              v-else-if="verify.method === 'linkedin'"
              v-model.trim="verify.payload.linkedin"
              label="Linkedin URL"
              placeholder="https://www.linkedin.com/company/.../"
              :rules="[rulesUrl.url]"
              persistent-hint
              hint="We’ll attempt a quick lookup preview"
            />
            
          </div>
        </v-expand-transition>

        <!-- Account fields live inside SAME v-form -->
        <v-text-field v-model.trim="accountForm.firstName" label="First Name"/>
        <v-text-field v-model.trim="accountForm.lastName"  label="Last Name" />
        <v-text-field
          v-model.trim="accountForm.email"
          label="Email"
          type="email"
          :rules="[emailRequired, emailFormat]"
          persistent-hint
        />

        <v-text-field
          v-model.trim="passwordOne"
          :type="showPass ? 'text' : 'password'"
          label="Enter New Password"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPass = !showPass"
        />
        <v-text-field
          v-model.trim="passwordTwo"
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

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>

          <!-- Intercept submit: show verification overlay first -->
          <v-btn
            color="primary"
            :loading="loading || verify.loadingPreview"
            :disabled="!canCreate"
            @click="handleCreateClick"
          >
            Create Brand
          </v-btn>
        </div>

        <!-- Verify & Confirm dialog -->
        <v-dialog v-model="verify.dialogOpen" max-width="640" scrollable>
          <v-card>
            <!-- Header -->
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h6">Verify Brand Details</div>
                <div v-if="verify.method" class="text-caption text-medium-emphasis mt-1">
                  Verification method: <span class="text-capitalize font-weight-medium">{{ verify.method }}</span>
                </div>
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="verify.dialogOpen = false"
              />
            </v-card-title>

            <v-divider />

            <!-- Content -->
            <v-card-text class="pa-4">
              <!-- Use the new dynamic component -->
              <CompanyPreviewCard
                :data="verify.preview"
                :loading="verify.loadingPreview"
              />

              <!-- No Data State -->
              <v-alert
                v-if="!verify.loadingPreview && !verify.preview?.name"
                type="warning"
                variant="tonal"
                density="comfortable"
                class="mt-4"
              >
                <template #prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                <div class="text-body-2">
                  <div class="font-weight-medium mb-1">No company data found</div>
                  <div>
                    We couldn't retrieve information for this 
                    {{ verify.method === 'website' ? 'website' : verify.method === 'linkedin' ? 'LinkedIn profile' : 'address' }}.
                    You can still proceed, but verification will be manual.
                  </div>
                </div>
              </v-alert>

              <!-- Editable Brand Name -->
              <v-text-field
                v-model="brandForm.name"
                label="Brand Name"
                hint="You can still edit this before creating"
                persistent-hint
                prepend-inner-icon="mdi-pencil"
                class="mt-4"
                variant="outlined"
                density="comfortable"
              />
            </v-card-text>

            <v-divider />

            <!-- Actions -->
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn
                variant="text"
                @click="verify.dialogOpen = false"
              >
                Go Back
              </v-btn>
              <v-btn
                color="primary"
                :loading="loading"
                variant="elevated"
                @click="finalizeCreate"
              >
                <v-icon start>mdi-check-circle</v-icon>
                Confirm & Create Brand
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-window-item>
    </v-window>
    <!-- reCAPTCHA badge notice (optional, for transparency) -->
    <div class="text-caption text-medium-emphasis mt-4">
      This site is protected by reCAPTCHA and the Google
      <a href="https://policies.google.com/privacy" target="_blank">Privacy Policy</a> and
      <a href="https://policies.google.com/terms" target="_blank">Terms of Service</a> apply.
    </div>
  </v-form>
</template>

<script setup>
import { useCompanyStore } from '@/store/company'
import { useUserStore } from '@/store/user'
import { stringIsEmail } from '@/utils/string'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import CompanyPreviewCard from './CompanyPreviewCard.vue'
const companyStore = useCompanyStore();
const showToast = inject('toast')?.show

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const userStore = useUserStore()
const { company } = storeToRefs(useCompanyStore())
let recaptchaReady = false



//EMITS
const emit = defineEmits(['cancel', "created", "joined"])

//TAB AND PAGE
const loading = ref(false)
const tab = ref('join')           // 'join' | 'create'
const verify = ref({
  method: null, // 'website' | 'address' | "linkedin"
  methodOptions: [
    { title: 'Business website URL', value: 'website' },
    { title: 'Headquarters address', value: 'address' },
    { title: 'Linkedin URL', value: 'linkedin' },
    { title: 'None', value: null}
  ],
  payload: {
    website: '',
    address: '',
    linkedin: '',
  },
  preview: {},           // data returned by quick lookup
  loadingPreview: false, // spinner for dialog
  dialogOpen: false,
})

const VERIFY_API = import.meta.env.VITE_BRANDORA_VERIFY_API_URL; 
function joinVerifyUrl() {
  const base = (VERIFY_API || '').replace(/\/+$/, ''); // trim trailing slash(es)
  return `${base}/verify`;
}

const isValidUrl = (v) => /^https?:\/\/[^ "]+$/i.test(v || '');
const ruleOk = (r, v) => r(v) === true || r(v) === undefined;

// JOIN via passcode
const passcode = ref('')


const brandForm = reactive({
  name: '',
  website: '',
})



// 3. account form
/**
 * HTML data nested in accountForm
 * Checks validity of the items in the form
 */

const accountForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

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

function same(a, b) {
  if (!a || !b) return false
  return a.firstName === b.firstName &&
         a.lastName  === b.lastName  &&
         a.email     === b.email     &&
         a.password  === b.password
}

const clientReady = computed(() =>
  !!accountForm.firstName && !!accountForm.lastName && !!accountForm.email
)
const passwordReady = computed(() =>
  rules.longerThan8 && rules.special && rules.number && rules.mixed && rules.match
)
const emailOK = computed(() => stringIsEmail(accountForm.email || ''))

const isValid = computed(() => clientReady.value && passwordReady.value && emailOK.value)

const accountValid = ref(false)
const accountRef = ref(null)

// Parent-level gating for the “Create Brand”  or "Join Brand" submit

const canJoin = computed(() =>
  !!passcode.value && isValid.value && !loading.value
)
const canCreate = computed(() =>
  !!brandForm.name && isValid.value && !loading.value
)

/* Basic client-side rules (augment as needed) */
const rulesUrl = {
  url: v => !v || /^https?:\/\/[^ "]+$/i.test(v) || 'Enter a valid URL (https://...)',
}

watch([passwordOne, passwordTwo], () => {
  const p = passwordOne.value || ''
  rules.longerThan8 = p.length > 8
  rules.special = /[!@#$%^&*(),.?":{}|<>]/.test(p)
  rules.number = /\d/.test(p)
  rules.mixed = /[a-z]/.test(p) && /[A-Z]/.test(p)
  rules.match = passwordOne.value === passwordTwo.value && passwordOne.value !== ''
  
  // This line updates the password in accountForm when they match
  accountForm.password = rules.match ? passwordOne.value : ''
}, { immediate: true })


function normalizeWebsite (url) {
  if (!url) return ''
  const hasProtocol = /^https?:\/\//i.test(url)
  return hasProtocol ? url : `https://${url}`
}

function decodeHtml(str = '') {
  const el = document.createElement('textarea');
  el.innerHTML = String(str);
  return el.value;
}


async function joinBrandDuped() {
  if (!passcode.value) return
  
  loading.value = true
  try {
    // Step 1: Get CAPTCHA token
    const captchaToken = await getCaptchaToken('join_brand')
    if (!captchaToken) {
      showToast?.({ message: 'Security verification failed', error: true })
      return
    }
    
    // Step 2: Validate invitation code
    const companyId = await companyStore.validateInvitationCode(passcode.value)
    if (!companyId) {
      showToast?.({ message: 'Invalid or expired invitation code', error: true })
      return
    }
    
    // Step 3: Create user account
    const userPayload = {
      ...accountForm,
      name: `${accountForm.firstName} ${accountForm.lastName}`,
      companyId: companyId,
      captchaToken
    }
    
    const user = await userStore.createUser(userPayload)
    
    // Success
    showToast?.({ 
      message: `Account created! Please verify your email to complete signup.`, 
      timeout: 6000 
    })

    await userStore.sendActivateEmail(user.email)
    emit('joined')
    
  } catch (e) {
    console.error('PORKNBEANS', e.response.data.error)
    const msg = e.response.data.error
    showToast?.({ message: msg, error: true })
    verify.dialogOpen = false
  } finally {
    loading.value = false
  }
}



async function createBrandDuped () {
  if (!canCreate.value) {
    // optional: hard check via the child's exposed validate()
    const ok = accountRef.value?.validate?.()
    if (!ok) {
      showToast?.({ message: 'Fix account fields before continuing.', error: true })
      return
    }
  }

  loading.value = true
  try {
    // Step 1: Get CAPTCHA token
    const captchaToken = await getCaptchaToken('join_brand')
    if (!captchaToken) {
      showToast?.({ message: 'Security verification failed', error: true })
      return
    }

    // Step 2: Create company and user in single atomic operation
    const payload = {
      company: {
        name: brandForm.name,
        status: 'active',
        profile: verify.value.preview
      },
      user: {
        ...accountForm,
        name: `${accountForm.firstName} ${accountForm.lastName}`,
        captchaToken // Send token to backend for user creation
      }
    }

    const { company, user } = await companyStore.createCompany(payload)

    showToast?.({ 
      message: `Brand ${company.name} created. Account created. Please verify your account in your linked email inbox, and then log in. Redirecting…`, 
      timeout: 6000 
    })
    emit('created')

  } catch (e) {
    const msg = e?.response?.data?.error || e?.response?.data?.message || 'Could not create brand or account.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}


/* Small helpers for previews */
const websiteHost = computed(() => {
  try { return verify.value.payload.website ? new URL(verify.value.payload.website).hostname : '' }
  catch { return '' }
})
const websiteFavicon = computed(() =>
  websiteHost.value
    ? `https://www.google.com/s2/favicons?domain=${websiteHost.value}&sz=64`
    : ''
)

/* Intercept the primary button click: open dialog and build preview */
async function handleCreateClick() {
  // Normalize/validate based on method
  if (verify.value.method === 'website' && verify.value.payload.website) {
    verify.value.payload.website = normalizeWebsite(verify.value.payload.website);
    if (!isValidUrl(verify.value.payload.website)) {
      showToast?.({ message: 'Enter a valid website URL (https://...)', error: true });
      return;
    }
  }
  else if (verify.value.method === 'linkedin' && verify.value.payload.linkedin) {
    verify.value.payload.linkedin = normalizeWebsite(verify.value.payload.linkedin);
    if (!isValidUrl(verify.value.payload.linkedin)) {
      showToast?.({ message: 'Enter a valid LinkedIn URL (https://...)', error: true });
      return;
    }
  }


  verify.value.dialogOpen = true;
  verify.value.loadingPreview = true;
  try {
    verify.value.preview = await buildPreview(verify.value.method, verify.value.payload);
  } catch (e) {
    console.error(e);
    verify.value.preview = {};
    showToast?.({ message: e.message || 'Preview failed', error: true });
  } finally {
    verify.value.loadingPreview = false;
  }
}


async function buildPreview(method, payload) {
  if (!VERIFY_API) throw new Error('VITE_BRANDORA_VERIFY_API_URL is missing');

  let body;
  let name = brandForm.name
  switch (method) {
    case 'website':  body = { method, name, payload: { url: payload.website } }; break;
    case 'address':  body = { method, name, payload: { address: payload.address } }; break;
    case 'linkedin':  body = { method, name, payload: { url: payload.linkedin } }; break;
    default: return {}; // no method, no preview
  }

  const res = await fetch(joinVerifyUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Preview failed (${res.status})`);
  return data;
}


/* Finalize submit: close dialog and run your original submit logic */
async function finalizeCreate() {
  // Optional: attach the chosen verification to brandForm
  brandForm.verification = {
    method: verify.value.method,
    payload: { ...verify.value.payload },
    preview: verify.value.preview, // or just persist on server
  }

  verify.value.dialogOpen = false

  // If your parent <v-form> uses @submit, you can call that handler directly,
  // or trigger the same function you would on submit. Example:
  await onSubmit() // <-- call your existing create function
}

const onSubmit = async () => {
  try {
    if (tab.value === 'join') {
      await joinBrandDuped()
    } else {
      await createBrandDuped()
    }
  } catch (e) {
    console.error('Submit error:', e)
    showToast?.({ message: 'Unexpected error. See console.', error: true })
  }
}

// 3. reCAPTCHA HELPER FUNCTION
/**
 * Get a reCAPTCHA token for the given action
 * @param {string} action - The action name (e.g., 'join_brand', 'create_brand')
 * @returns {Promise<string|null>} The reCAPTCHA token or null if unavailable
 */
async function getCaptchaToken(action) {
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('Skipping CAPTCHA - no site key configured')
    return null
  }

  if (!recaptchaReady || !window.grecaptcha) {
    console.warn('reCAPTCHA not ready yet')
    return null
  }

  try {
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
    return token
  } catch (error) {
    console.error('reCAPTCHA error:', error)
    showToast?.({ 
      message: 'Security verification failed. Please try again.', 
      error: true 
    })
    return null
  }
}

// LIFECYCLE HOOKS
onMounted(() => {
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('VITE_RECAPTCHA_SITE_KEY not set. CAPTCHA will be skipped.')
    return
  }

  // Load reCAPTCHA script
  if (!window.grecaptcha) {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => {
      recaptchaReady = true
    }
    document.head.appendChild(script)
  } else {
    recaptchaReady = true
  }
})

onBeforeUnmount(() => {
  // Hide the reCAPTCHA badge when component unmounts
  const badge = document.querySelector('.grecaptcha-badge')
  if (badge) {
    badge.style.visibility = 'hidden'
  }
})


</script>
