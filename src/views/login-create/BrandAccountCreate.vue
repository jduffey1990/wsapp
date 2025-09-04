<template>
  <v-form @submit.prevent="tab === 'join' ? joinBrandDuped() : createBrandDuped()">
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
        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="loading" :disabled="!passcode">
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

        <v-select
          v-model="brandForm.category"
          :items="categories"
          label="What best describes you?"
          hint="Choose the closest fit"
          persistent-hint
          required
        />

        <v-text-field v-model.trim="brandForm.industry" label="Industry (optional)" />

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

const emit = defineEmits(['brand-linked', 'cancel'])

const showToast = inject('toast')?.show
// swap to $bracketsApi if your brand endpoints live there
const $users = inject('$usersApi')

const loading = ref(false)
const tab = ref('join')           // 'join' | 'create'

// JOIN via passcode
const passcode = ref('')

// CREATE brand
const categories = [
  'Retailer / Wholesaler',
  'Product Brand (General)',
]

const brandForm = reactive({
  name: '',
  website: '',
  category: null,   // one of categories[]
  industry: ''
})

const canCreate = computed(() => !!brandForm.name && !!brandForm.category)

function normalizeWebsite (url) {
  if (!url) return ''
  const hasProtocol = /^https?:\/\//i.test(url)
  return hasProtocol ? url : `https://${url}`
}

async function joinBrandDuped () {
  if (!passcode.value) return
  loading.value = true
  try {
    
    const { id, name } = {id: 75848949, name:"Duffey's Dapper Duds"}
    showToast?.({ message: `Joined ${name}` })
    emit('brand-linked', { id, name })
  } catch (e) {
    const msg = e?.response?.data?.message || 'Invalid passcode.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

async function joinBrand () {
  if (!passcode.value) return
  loading.value = true
  try {
    // TODO: update endpoint to your API
    const res = await $users.post('/brands/join', { passcode: passcode.value })
    const { id, name } = res.data
    showToast?.({ message: `Joined ${name}` })
    emit('brand-linked', { id, name })
  } catch (e) {
    const msg = e?.response?.data?.message || 'Invalid passcode.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

async function createBrandDuped () {
  if (!canCreate.value) return
  loading.value = true
  try {
    const payload = {
      name: brandForm.name,
      website: normalizeWebsite(brandForm.website),
      category: brandForm.category,
      industry: brandForm.industry || undefined
    }
    const { id, name } = {id: 75848949, name:"Duffey's Dapper Duds"}
    showToast?.({ message: `Brand ${name} created.` })
    emit('brand-linked', { id, name })
  } catch (e) {
    const msg = e?.response?.data?.message || 'Could not create brand.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

async function createBrand () {
  if (!canCreate.value) return
  loading.value = true
  try {
    const payload = {
      name: brandForm.name,
      website: normalizeWebsite(brandForm.website),
      category: brandForm.category,
      industry: brandForm.industry || undefined
    }
    // TODO: update endpoint to your API
    const res = await $users.post('/brands', payload)
    const { id, name } = res.data
    showToast?.({ message: `Brand ${name} created.` })
    emit('brand-linked', { id, name })
  } catch (e) {
    const msg = e?.response?.data?.message || 'Could not create brand.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}


</script>
