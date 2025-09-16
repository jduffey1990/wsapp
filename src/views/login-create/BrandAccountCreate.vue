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


        <!-- Account fields live inside the SAME v-form -->
        <ProfileAccountFields
          v-model="accountForm"       
          :disabled="loading"
          @valid="accountValid = $event"
          ref="accountRef"
        />
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

        <v-text-field
          v-model.trim="brandForm.website"
          label="Website (optional)"
          hint="Example: https://brand.com"
          persistent-hint
        />

        <!-- Account fields live inside the SAME v-form -->
        <ProfileAccountFields
          v-model="accountForm"        
          :disabled="loading"
          @valid="accountValid = $event"
          ref="accountRef"
        />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="loading" :disabled="!canCreate">
            Create Brand
          </v-btn>
        </div>
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { inject, reactive, ref, computed } from 'vue'
import ProfileAccountFields from './ProfileAccountFields.vue'
const showToast = inject('toast')?.show

//EMITS
const emit = defineEmits(['brand-linked', 'cancel', "created", "joined"])

//TAB AND PAGE
const loading = ref(false)
const tab = ref('join')           // 'join' | 'create'

// JOIN via passcode
const passcode = ref('')


const brandForm = reactive({
  name: '',
  website: '',
})
const accountForm = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: ''
})
const accountValid = ref(false)
const accountRef = ref(null)

// you can store the result of brand creation here if needed
const createdBrand = ref(null)

// Parent-level gating for the “Create Brand”  or "Join Brand" submit

const canJoin = computed(() =>
  !!passcode.value && accountValid.value && !loading.value
)
const canCreate = computed(() =>
  !!brandForm.name && accountValid.value && !loading.value
)


function normalizeWebsite (url) {
  if (!url) return ''
  const hasProtocol = /^https?:\/\//i.test(url)
  return hasProtocol ? url : `https://${url}`
}

async function joinBrandDuped () {
  console.log("passscode", passcode.value)
  if (!passcode.value) return
  loading.value = true
  try {
    const { id, name } = { id: 75848949, name: 'Duffey\'s Dapper Duds' }
    showToast?.({ message: `Joined ${name}. Please verify your account in your linked email inbox, and then log in. Redirecting…`, timeout:6000 })
    emit('brand-linked', { id, name })
    emit('joined')
  } catch (e) {
  console.error('joinBrandDuped error:', e)
  const msg = e?.response?.data?.message ?? e?.message ?? 'Unexpected error'
  showToast?.({ message: msg, error: true })
  }
 finally {
    loading.value = false
  }
}

async function createBrandDuped () {
  if (!canCreate.value) {
    // optional: hard check via the child’s exposed validate()
    const ok = accountRef.value?.validate?.()
    if (!ok) {
      showToast?.({ message: 'Fix account fields before continuing.', error: true })
      return
    }
  }

  loading.value = true
  try {
    // 1) Create the brand
    const brandPayload = {
      name: brandForm.name,
      website: normalizeWebsite(brandForm.website),
    }
    const brand = { id: 75848949, name: 'Duffey\'s Dapper Duds' } // fake
    createdBrand.value = brand

    // 2) Create the user (use the data coming from child via v-model)
    const userPayload = {
      ...accountForm,
      name: `${accountForm.firstName} ${accountForm.lastName}`,
      brandId: brand.id
    }

    // Fake request wait
    await new Promise(r => setTimeout(r, 500))

    showToast?.({ message: `Brand ${brand.name} created. Account created. Please verify your account in your linked email inbox, and then log in.  Redirecting…`, timeout:6000 })
    emit('brand-linked', { id: brand.id, name: brand.name })
    emit('created')
  } catch (e) {
    const msg = e?.response?.data?.message || 'Could not create brand or account.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
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

</script>
