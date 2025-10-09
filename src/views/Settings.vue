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

      <!-- ===== Brand Codes Section ===== -->
      <v-card-text>
        <!-- Header / CTA -->
        <div class="table-title px-4 py-3 d-flex align-center justify-space-between">
          <div class="text-h6">Synthize brand code for new teammember</div>
          <v-btn
            color="warning"
            elevation="2"
            @click="openCreateDialog"
          >
            Create Brand Code
          </v-btn>
        </div>

        <!-- Loading / Empty states -->
        <v-skeleton-loader
          v-if="loading"
          class="mt-6"
          type="card, card, card"
        />
        <div v-else-if="!codes.length" class="mt-8 text-center">
          <div class="text-subtitle-1 mb-2">No team members yet</div>
          <div class="text-body-2 mb-4">
            Start by creating your first code to invite team members
          </div>
        </div>

        <!-- Codes grid -->
        <v-row v-else class="mt-4" dense>
          <v-col
            v-for="code in codes"
            :key="code.id"
            cols="12" sm="6" md="4" lg="3"
          >
            <v-card elevation="3" class="table-title">
              <v-card-title class="text-subtitle-1">
                {{ code.code }}
              </v-card-title>
              <v-card-text class="text-body-2">
                <div class="meta-line">
                  <strong class="mr-1">Created:</strong> {{ formatDate(code.created_at) }}
                </div>
                <div class="meta-line">
                  <strong class="mr-1">Expires:</strong> {{ formatDate(expiresAt(code)) }}
                </div>
                <div class="mt-2">
                  <v-chip
                    :color="isLapsed(code) ? 'error' : 'secondary'"
                    size="small"
                    label
                  >
                    {{ isLapsed(code) ? 'Lapsed' : 'Active' }}
                  </v-chip>
                </div>
              </v-card-text>
              <v-spacer />
              <v-card-actions class="justify-end">
                <v-btn v-if="!isLapsed(code)" variant="text" @click="copyToClipboard(code.code)">Copy</v-btn>
                <v-btn
                  v-if="!isLapsed(code)"
                  color="primary"
                  variant="flat"
                  @click="openSendDialogForExisting(code)"
                >
                  Send email
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Create / Send dialog -->
      <v-dialog v-model="dialog.open" max-width="560">
        <v-card class="dialogue-email">
          <v-card-title class="text-h6">
            {{ dialog.mode === 'create' ? 'Create Code' : 'Send Code' }}
          </v-card-title>

          <v-card-subtitle class="px-4">
            Your code is <strong>{{ currentCode }}</strong>
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
import { reactive, onBeforeUnmount, onMounted, ref, computed, inject } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { parseError } from '@/utils/error'
import brandlogo from '@/assets/brandora.png'

/* ===== Injects / stores ===== */
const $users = inject('$usersApi')
const { show } = inject('toast')
const { user } = storeToRefs(useUserStore())

/* ===== Settings (existing) ===== */
const isEditing = ref(false)
const account = ref({
  firstName: 'Lori',
  lastName: 'Lightfoot',
  email: 'loggedinuser@gmail.com',
})
const accountCopy = ref({ ...account.value })

const getUser = async () => {
  try {
    const response = await $users.get(`/get-user?id=${user.value._id}`)
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
  try {
    accountCopy.value = { ...account.value }
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

/* ===== Brand Codes (integrated) ===== */
const loading = ref(false)
const saving  = ref(false)
const codes   = ref([]) // [{ id, code, created_at }]
const formRef = ref(null)
const formIsValid = ref(false)

const dialog = ref({
  open: false,
  mode: 'create', // 'create' | 'resend'
})
const currentCode = ref('')

const form = ref({
  email: '',
  subject: 'Brandora Invitation Code',
  bodyTemplate: 'Here is your invitation code: {CODE} Sign up at https://brandora.com to get started!',
  image: ''
})

const rules = {
  required: v => !!v || 'Required',
  email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email'
}

const inviteBody = computed({
  get() {
    return (form.value.bodyTemplate || '').replace('{CODE}', currentCode.value || '')
  },
  set(v) {
    form.value.bodyTemplate = v.replace(currentCode.value, '{CODE}')
  }
})

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const expiresAt = (c) => new Date(new Date(c.created_at).getTime() + ONE_DAY_MS)
const isLapsed  = (c) => Date.now() >= expiresAt(c).getTime()

function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleString()
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
  show?.({ message: 'Code copied to clipboard', error: false })
}

/* ---- Fake API calls (replace with real calls) ---- */
async function apiListCodes() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const expired = Array.from({ length: 4 }).map((_, i) => ({
    id: `expired-${i}`,
    code: `EXPIRED-${i + 1}`,
    created_at: new Date(now - (i + 2) * day).toISOString(),
  }))

  // add one fresh asynchronously to show “live” behavior
  setTimeout(() => {
    const fresh = {
      id: 'active-1',
      code: 'ACTIVE-1234',
      created_at: new Date().toISOString(),
    }
    codes.value = [fresh, ...codes.value]
  }, 1000)

  return expired
}

async function apiCreateCode(newCode) {
  return {
    id: Math.random().toString(36).slice(2),
    code: newCode,
    created_at: new Date().toISOString(),
  }
}

async function apiSendEmail({ codeId, email, subject, body, image }) {
  // real impl: await $api.post(`/brand-codes/${codeId}/send`, {...})
  return true
}

/* ---- Lifecycle ---- */
onMounted(async () => {
  await getUser()
  window.addEventListener('beforeunload', beforeUnloadHandler)

  // Load codes
  await loadCodes()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

/* ---- Codes loader ---- */
async function loadCodes() {
  loading.value = true
  try {
    const list = await apiListCodes()
    codes.value = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } finally {
    loading.value = false
  }
}

/* ---- Dialog flows ---- */
async function openCreateDialog() {
  dialog.value.mode = 'create'
  const uuid = crypto.randomUUID()
  const created = await apiCreateCode(uuid)
  codes.value = [created, ...codes.value]
  currentCode.value = created.code

  form.value.email = ''
  form.value.image = ''
  dialog.value.open = true
}

function openSendDialogForExisting(code) {
  dialog.value.mode = 'resend'
  currentCode.value = code.code
  form.value.email = ''
  form.value.image = ''
  dialog.value.open = true
}

function closeDialog() {
  dialog.value.open = false
}

/* ---- Send email ---- */
async function sendEmail() {
  try {
    saving.value = true
    const record = codes.value.find(c => c.code === currentCode.value)
    if (!record) throw new Error('Code record not found')

    await apiSendEmail({
      codeId: record.id,
      email: form.value.email.trim(),
      subject: form.value.subject,
      body: inviteBody.value,
      image: form.value.image || brandlogo
    })
    closeDialog()
    show?.({ message: 'Invitation sent!' })
  } catch (e) {
    console.error(e)
    show?.({ message: 'Failed to send email', error: true })
  } finally {
    saving.value = false
  }
}
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

/* ===== Brand Codes styles (blends with your glass look) ===== */
.table-title {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.dialogue-email {
  border-radius: 16px;
  background: rgba(255,255,255,1);
  border: 1px solid rgba(0,0,0,0.05);
}

.v-row.mt-4 > .v-col > .v-card {
  border-radius: 16px;
  background: linear-gradient(180deg, var(--glass-top, rgba(255,255,255,0.32)), var(--glass-bot, rgba(255,255,255,0.18)));
  backdrop-filter: blur(6px);
  border: 1px solid var(--border-soft, rgba(0,0,0,0.05));
  box-shadow: 0 1px 1px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.06);
}

.v-row.mt-4 > .v-col > .v-card .v-card-title {
  font-weight: 700;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding-bottom: 10px;
}
.v-row.mt-4 > .v-col > .v-card .v-card-actions {
  border-top: 1px solid rgba(0,0,0,0.06);
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
