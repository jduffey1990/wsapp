<template>
  <v-layout class="justify-center pa-4">
    <v-card class="main-card">
      <!-- Top Toolbar -->
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
            v-if="isEditing"
            color="primary"
            variant="elevated"
            @click="saveProfile()"
          >
            Save
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="warning"
            variant="elevated"
            @click="cancelEdit"
          >
            Cancel Edit
          </v-btn>
          <v-btn
            v-else
            color="secondary"
            variant="elevated"
            @click="startEditing"
          >
            Edit Settings
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <!-- Profile fields -->
      <v-card-text>
        <v-text-field
          v-model="account.firstName"
          label="First name"
          :readonly="!isEditing"
        />
        <br />
        <v-text-field
          v-model="account.lastName"
          label="Last name"
          :readonly="!isEditing"
        />
        <br />
        <v-text-field
          label="Email"
          type="email"
          v-model="account.email"
          :readonly="!isEditing"
        />
        <br />
      </v-card-text>

      <v-divider class="my-4" />

      <!-- ===== Brand Code Section ===== -->
      <v-card-text>
        <div class="text-h6 mb-4">Team Invitation Code</div>

        <!-- Loading state -->
        <v-skeleton-loader
          v-if="loading"
          class="mt-6"
          type="card"
        />

        <!-- No code state -->
        <div v-else-if="!code.code" class="mt-8 text-center">
          <div class="text-subtitle-1 mb-2">No invitation code yet</div>
          <div class="text-body-2 mb-4">
            Generate a code to invite team members
          </div>
          <v-btn
            color="primary"
            elevation="2"
            @click="get"
          >
            Generate Code
          </v-btn>
        </div>

        <!-- Code card -->
        <v-card v-else elevation="3" class="code-card">
          <v-card-text>
            <!-- Clickable code -->
            <div 
              class="code-display" 
              @click="copyToClipboard(code.code)"
              role="button"
              tabindex="0"
            >
              <div class="text-caption mb-1">Click to copy</div>
              <div class="code-text">{{ code.code }}</div>
            </div>

            <!-- Expiry info -->
            <div class="mt-4 text-body-2">
              <div class="meta-line">
                <strong class="mr-1">Expires:</strong> {{ formatDate(code.expiresAt) }}
              </div>
            </div>
          </v-card-text>

          <!-- Actions -->
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              color="warning"
              @click="refreshCode"
              :loading="refreshing"
            >
              Refresh Code
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="openEmailDialog"
            >
              Email Code
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card-text>

      <!-- Email dialog -->
      <v-dialog v-model="dialog.open" max-width="560">
        <v-card class="dialogue-email">
          <v-card-title class="text-h6">
            Send Invitation Email
          </v-card-title>

          <v-card-subtitle class="px-4">
            Your code is <strong>{{ code.code }}</strong>
          </v-card-subtitle>

          <v-card-text>
            <v-form ref="formRef" v-model="formIsValid">
              <v-text-field
                v-model="form.email"
                label="Recipient Email"
                class="mb-3"
                :rules="[rules.required, rules.email]"
                autofocus
              />
              <v-text-field
                v-model="form.subject"
                label="Subject"
                class="mb-3"
              />
              <v-textarea
                v-model="inviteBody"
                label="Body"
                class="mb-3"
                auto-grow
              />
              <div class="mb-2 text-caption">Image (used in email template)</div>
              <v-text-field
                v-model="form.image"
                label="Blank to use default shown below"
                class="mb-2"
                placeholder="Leave blank to use default brand logo"
              />
              <v-img
                :src="form.image || brandlogo"
                height="120"
                class="rounded mt-1"
                cover
              />
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!formIsValid"
              @click="sendEmail"
            >
              Send email
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-layout>
</template>

<script setup>
import brandlogo from '@/assets/mozaiq.png'
import { useCompanyStore } from '@/store/company'
import { useUserStore } from '@/store/user'
import { parseError } from '@/utils/error'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

/* ===== Injects / stores ===== */
const $users = inject('$usersApi')
const $companies = inject('$companiesApi')
const { show } = inject('toast')
const userStore = useUserStore()
const companyStore = useCompanyStore()
const { user } = storeToRefs(useUserStore())

/* ===== Settings (existing) ===== */
const isEditing = ref(false)
const account = ref({
  firstName: '',
  lastName: '',
  email: '',
})
const accountCopy = ref({ ...account.value })

const getUser = async () => {
  try {
    const response = await $users.get(`/get-user?id=${user.value.id}`)
    const userReturned = response.data
    const arrayOfNames = userReturned.name.split(' ')
    account.value.firstName = arrayOfNames[0]
    account.value.lastName = arrayOfNames[1]
    account.value.email = userReturned.email
    accountCopy.value = { ...account.value }
  } catch (error) {
    console.error(error)
  }
}

const startEditing = () => { isEditing.value = true }
const cancelEdit = () => {
  isEditing.value = false
  account.value = { ...accountCopy.value }
}
const hasUnsavedChanges = () => JSON.stringify(account.value) !== JSON.stringify(accountCopy.value)
const saveProfile = async () => {
  console.log('Saving profile...')
  try {
    accountCopy.value = { ...account.value }
    await userStore.updateUser(account.value)
    show?.({ message: 'Account saved!' })
    isEditing.value = false
  } catch (error) {
    show?.({ message: parseError(error), error: true })
  }
}
const beforeUnloadHandler = (event) => {
  if (hasUnsavedChanges() && isEditing.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

/* ===== Brand Code ===== */
const loading = ref(false)
const refreshing = ref(false)
const saving = ref(false)
const code = ref({}) // { id, code, expiresAt }
const formRef = ref(null)
const formIsValid = ref(false)

const dialog = ref({
  open: false,
})

const form = ref({
  email: '',
  subject: 'MOZAIQ Invitation Code',
  bodyTemplate: 'Here is your invitation code: {CODE}\n\nSign up at https://mozaiqretail.com to get started!',
  image: ''
})

const rules = {
  required: v => !!v || 'Required',
  email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email'
}

const inviteBody = computed({
  get() {
    return (form.value.bodyTemplate || '').replace('{CODE}', code.value.code || '')
  },
  set(v) {
    form.value.bodyTemplate = v.replace(code.value.code || '', '{CODE}')
  }
})

const isExpired = computed(() => {
  if (!code.value.expiresAt) return false
  return new Date(code.value.expiresAt) < new Date()
})

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleString()
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
  show?.({ message: 'Code copied to clipboard!', error: false })
}

/* ---- API calls ---- */
async function loadCode() {
  loading.value = true
  try {
    const companyId = user.value.companyId
    if (!companyId) {
      console.warn('No companyId found for user')
      return
    }
    
    const response = await companyStore.getInvitationCodes(companyId)
    code.value = response
  } catch (error) {
    console.error('Failed to load invitation code:', error)
    // Don't show error toast if it's just because no code exists yet
    if (error.response?.status !== 404) {
      show?.({ message: 'Failed to load invitation code', error: true })
    }
  } finally {
    loading.value = false
  }
}

async function refreshCode() {
  refreshing.value = true
  try {
    const codeId = code.value.id
    const companyId = user.value.companyId
    if (!companyId || !codeId) throw new Error('Missing code or company ID')
    
    // Delete old code
    await companyStore.deleteThisCode(codeId)
    
    // Get new code
    const response = await companyStore.getInvitationCodes(companyId)
    code.value = response // ← Remove .data, store already returns response.data
    
    show?.({ message: 'Code refreshed successfully!' })
  } catch (error) {
    console.error('Failed to refresh code:', error)
    show?.({ message: 'Failed to refresh code', error: true })
  } finally {
    refreshing.value = false
  }
}

async function sendEmail() {
  try {
    saving.value = true

    const packet = {
      code: code.value.code,
      email: form.value.email.trim(),
      subject: form.value.subject,
      body: inviteBody.value,
      image: form.value.image || brandlogo
    }
    
    await companyStore.sendInvitationEmail(packet)
    
    closeDialog()
    show?.({ message: 'Invitation sent!' })
  } catch (e) {
    console.error(e)
    show?.({ message: 'Failed to send email', error: true })
  } finally {
    saving.value = false
  }
}

/* ---- Dialog ---- */
function openEmailDialog() {
  form.value.email = ''
  form.value.image = ''
  dialog.value.open = true
}

function closeDialog() {
  dialog.value.open = false
}

/* ---- Lifecycle ---- */
onMounted(async () => {
  await getUser()
  window.addEventListener('beforeunload', beforeUnloadHandler)
  await loadCode()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<style scoped>
/* ===== Existing styles ===== */
.sub_header {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-bottom: 2px solid black;
  padding-bottom: 5px;
  width: fit-content;
}
.toggle { transform: translateY(-10px); }
.main-card { width: 600px !important; }
.client-move {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
@media (max-width: 700px) {
  .main-card { min-width: 95vw; }
  .title-holder { max-height: 64px !important; }
  .title-holder .v-btn { font-size: xx-small; }
  .title { margin-bottom: 80px; font-size: small; }
}

/* ===== Code Card styles ===== */
.code-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.code-display {
  background: rgba(91,146,121,0.08);
  border: 2px solid rgba(91,146,121,0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-display:hover {
  background: rgba(91,146,121,0.12);
  border-color: rgba(91,146,121,0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91,146,121,0.2);
}

.code-text {
  font-size: 20px;
  font-weight: 700;
  color: #2b5345;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.dialogue-email {
  border-radius: 16px;
  background: rgba(255,255,255,1);
  border: 1px solid rgba(0,0,0,0.05);
}

.v-chip { font-weight: 600; }
.v-chip--size-small {
  background: rgba(91,146,121,0.12);
  border: 1px solid rgba(91,146,121,0.28);
  color: var(--brand-secondary, #2b5345);
}
.v-chip.error {
  background: rgba(214,73,51,0.12) !important;
  border: 1px solid rgba(214,73,51,0.28) !important;
}

.meta-line {
  display: flex;
  align-items: center;
  line-height: 1.3;
  margin-bottom: 6px;
}
</style>