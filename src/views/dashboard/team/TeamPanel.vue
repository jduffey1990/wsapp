<template>
  <v-container fluid>
    <!-- Header / CTA -->
    <div class="table-title" style="background-color: whitesmoke;">
      <div class="text-h6 ml-4 mt-4">Synthize brand code for new teammember</div>
      <v-btn
        color="warning"
        class="mt-4 mr-4"
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
      <div class="text-body-2 mb-4">Start by creating your first code to invite team members</div>
    </div>

    <!-- Codes grid -->
    <v-row v-else class="mt-4" dense>
      <v-col
        v-for="code in codes"
        :key="code.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card elevation="3" class="h-100 d-flex flex-column">
          <v-card-title class="text-subtitle-1">
            {{ code.code }}
          </v-card-title>
          <v-card-text class="text-body-2">
            <div><strong>Created:</strong> {{ formatDate(code.created_at) }}</div>
            <div><strong>Expires:</strong> {{ formatDate(expiresAt(code)) }}</div>
            <div class="mt-2">
              <v-chip
                :color="isLapsed(code) ? 'error' : 'success'"
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

    <!-- Create / Send dialog -->
    <v-dialog v-model="dialog.open" max-width="560">
      <v-card>
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
              label="Image URL"
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import brandlogo from '@/assets/brandora.png' // ✅ correct import
const { show } = inject('toast')

// ---- State ----
const loading = ref(false)
const saving  = ref(false)
const codes   = ref([]) // [{ id, code, created_at, ... }]
const formRef = ref(null)
const formIsValid = ref(false)

const dialog = ref({
  open: false,
  mode: 'create', // 'create' | 'resend'
})

const currentCode = ref('') // the code visible in dialog

// Form state (defaults)
const form = ref({
  email: '',
  subject: 'Brandora Invitation Code',
  bodyTemplate: 'Here is your invitation code: {CODE} Sign up at https://brandora.com to get started!',
  image: '' // empty uses default brandlogo
})

// ---- Validation rules ----
const rules = {
  required: v => !!v || 'Required',
  email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email'
}

// ---- Computeds ----
const inviteBody = computed({
  get() {
    // Safely substitute current code into the template
    return (form.value.bodyTemplate || '').replace('{CODE}', currentCode.value || '')
  },
  set(v) {
    // Allow user edits, keep {CODE} placeholder if they remove it
    form.value.bodyTemplate = v.replace(currentCode.value, '{CODE}')
  }
})

// ---- Helpers ----
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const expiresAt = (c) => new Date(new Date(c.created_at).getTime() + ONE_DAY_MS)
const isLapsed  = (c) => Date.now() >= expiresAt(c).getTime()

function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleString()
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
  show({
      message: `Code copied to clipboard`,
      error: false
    });
}
// ---- API calls (replace with real API calls) ----
async function apiListCodes() {
  // Pretend we already had 4 expired codes
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const expired = Array.from({ length: 4 }).map((_, i) => ({
    id: `expired-${i}`,
    code: `EXPIRED-${i + 1}`,
    created_at: new Date(now - (i + 2) * day).toISOString(), // 2+ days old
  }))

  // Return those immediately
  const baseList = [...expired]

  // Add one fresh code after 1000ms
  setTimeout(() => {
    const fresh = {
      id: 'active-1',
      code: 'ACTIVE-1234',
      created_at: new Date().toISOString(),
    }
    codes.value = [fresh, ...codes.value] // push into live state
  }, 1000)

  return baseList
}

async function apiCreateCode(newCode) {
  // Replace with real call
  // const res = await $brand.post('/brand-codes', { code: newCode })
  // return res.data
  return {
    id: Math.random().toString(36).slice(2),
    code: newCode,
    created_at: new Date().toISOString()
  }
}

async function apiSendEmail({ codeId, email, subject, body, image }) {
  // Replace with real call
  // await $brand.post(`/brand-codes/${codeId}/send`, { email, subject, body, image })
  return true
}

// ---- Lifecycle ----
onMounted(loadCodes)


// ---- Load codes ----
async function loadCodes() {
  loading.value = true
  try {
    const list = await apiListCodes()
    // sort newest first
    codes.value = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } finally {
    loading.value = false
  }
}

// ---- Dialog flows ----
async function openCreateDialog() {
  dialog.value.mode = 'create'
  // Create a new UUID immediately (and persist it so it shows in the grid)
  const uuid = crypto.randomUUID()
  const created = await apiCreateCode(uuid)
  // put at top
  codes.value = [created, ...codes.value]
  currentCode.value = created.code

  // reset form (keep subject default)
  form.value.email = ''
  form.value.image = ''
  // keep template; body shows computed with current code
  dialog.value.open = true
}

function openSendDialogForExisting(code) {
  dialog.value.mode = 'resend'
  currentCode.value = code.code
  // Reset email; keep other defaults
  form.value.email = ''
  form.value.image = ''
  dialog.value.open = true
}

function closeDialog() {
  dialog.value.open = false
}

// ---- Send email ----
async function sendEmail() {

  try {
    saving.value = true
    // find the code record by currentCode
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
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>


<style scoped>
.product-card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-line {
  display: flex;
  align-items: center;
  line-height: 1.2;
  margin-bottom: 4px;
}

.table-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 10px;
}
</style>
