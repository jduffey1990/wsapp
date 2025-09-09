<!-- src/components/BrandPanel.vue -->
<template>
  <v-container fluid>
    <!-- Header / CTA -->
    <div class="table-title">
      <div>
        <div class="text-h6">Brand Profile</div>
        <div class="text-caption text-medium-emphasis">
          Manage the public-facing details of your brand.
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-chip
          size="small"
          :color="profileCompleted ? 'success' : 'warning'"
          label
        >
          {{ profileCompleted ? 'Profile: Complete' : 'Profile: Incomplete' }}
        </v-chip>
        <v-btn
          color="primary"
          :prepend-icon="profileCompleted ? 'mdi-pencil' : 'mdi-rocket-launch-outline'"
          @click="openWizard()"
        >
          {{ profileCompleted ? 'Edit Profile' : 'Build Profile' }}
        </v-btn>
      </div>
    </div>

    <!-- Loading / Empty states -->
    <v-skeleton-loader
      v-if="loading"
      class="mt-6"
      type="card, list-item-two-line, image"
    />
    <div v-else-if="!brand" class="mt-8 text-center">
      <div class="text-subtitle-1 mb-2">No brand linked yet</div>
      <div class="text-body-2">Join or create a brand first.</div>
    </div>

    <!-- Brand Summary -->
    <v-row v-else class="mt-2" dense>
      <v-col cols="12" md="12">
        <v-card class="product-card">
          <v-card-text>
            <div class="d-flex ga-4 align-start">
              <v-avatar size="72" rounded="lg" class="elevation-1">
                <v-img :src="profile.logo || placeholderLogo" cover />
              </v-avatar>
              <div class="flex-1">
                <div class="text-h6 truncate">{{ brand.name }}</div>
                <div class="text-body-2 text-medium-emphasis truncate">
                  {{ profile.tagline || 'Add a short tagline' }}
                </div>
                <div class="mt-2 d-flex align-center ga-2">
                  <v-chip size="x-small" label variant="tonal">
                    {{ brand.category || 'Uncategorized' }}
                  </v-chip>
                  <v-chip v-if="brand.industry" size="x-small" label variant="tonal">
                    {{ brand.industry }}
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <div class="meta-line">
              <v-icon size="18" class="mr-2">mdi-web</v-icon>
              <a
                v-if="brand.website"
                class="text-primary truncate"
                :href="brand.website"
                target="_blank"
                rel="noopener"
              >
                {{ brand.website }}
              </a>
              <span v-else class="text-medium-emphasis">Add website</span>
            </div>
            <div class="meta-line">
              <v-icon size="18" class="mr-2">mdi-email-outline</v-icon>
              <span class="truncate">{{ profile.contact_email || 'Add contact email' }}</span>
            </div>
            <div class="meta-line">
              <v-icon size="18" class="mr-2">mdi-map-marker-outline</v-icon>
              <span class="truncate">{{ profile.hq_location || 'Add HQ location' }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Key Details -->
      <v-col cols="12" md="12">
        <v-card class="product-card overview-card">
            <v-card-title class="py-3 d-flex align-center">
            <v-icon class="mr-2">mdi-text-box-outline</v-icon>
            Overview
            </v-card-title>

            <v-card-text class="pt-0">
            <v-row dense>
                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Description</div>
                    <div class="kv__value clamp-3">
                    {{ profile.description || 'Add a short description about your brand and products.' }}
                    </div>
                </div>
                </v-col>

                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Price Tier</div>
                    <div class="kv__value">
                    <v-chip
                        v-if="profile.price_tier"
                        size="small"
                        label
                        class="chip-tonal"
                    >{{ profile.price_tier }}</v-chip>
                    <span v-else class="empty-pill">Unset</span>
                    </div>
                </div>

                <div class="kv mt-4">
                    <div class="kv__label">Sales Channels</div>
                    <div class="kv__value">
                    <template v-if="profile.sales_channels?.length">
                        <v-chip
                        v-for="s in profile.sales_channels"
                        :key="s"
                        size="x-small"
                        class="mr-1 mb-1 chip-tonal"
                        label
                        >{{ s }}</v-chip>
                    </template>
                    <span v-else class="empty-pill">Unset</span>
                    </div>
                </div>
                </v-col>
            </v-row>

            <v-divider class="my-6 soft-divider" />

            <v-row dense>
                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Target Markets</div>
                    <div class="kv__value">
                    <template v-if="profile.target_markets?.length">
                        <v-chip
                        v-for="t in profile.target_markets"
                        :key="t"
                        size="x-small"
                        class="mr-1 mb-1 chip-tonal"
                        label
                        >{{ t }}</v-chip>
                    </template>
                    <span v-else class="empty-pill">Unset</span>
                    </div>
                </div>

                <div class="kv mt-4">
                    <div class="kv__label">Categories</div>
                    <div class="kv__value">
                    <template v-if="profile.categories?.length">
                        <v-chip
                        v-for="c in profile.categories"
                        :key="c"
                        size="x-small"
                        class="mr-1 mb-1 chip-tonal"
                        label
                        >{{ c }}</v-chip>
                    </template>
                    <span v-else class="empty-pill">Unset</span>
                    </div>
                </div>
                </v-col>

                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Wholesale</div>
                    <div class="kv__value grid-2">
                    <div><span class="muted">MOQ</span> <strong>{{ profile.wholesale?.moq ?? '—' }}</strong></div>
                    <div><span class="muted">Lead Time</span> <strong>{{ profile.wholesale?.lead_time ?? '—' }}</strong></div>
                    <div><span class="muted">Case Pack</span> <strong>{{ profile.wholesale?.case_pack ?? '—' }}</strong></div>
                    </div>
                </div>

                <div class="kv mt-4">
                    <div class="kv__label">Fulfillment</div>
                    <div class="kv__value">
                    {{ profile.fulfillment || 'Unset' }}
                    </div>
                </div>

                <div class="kv mt-4">
                    <div class="kv__label">Returns</div>
                    <div class="kv__value">
                    {{ profile.return_policy || 'Unset' }}
                    </div>
                </div>
                </v-col>
            </v-row>

            <v-divider class="my-6 soft-divider" />

            <v-row dense>
                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Social</div>
                    <div class="kv__value">
                    <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-instagram</v-icon>
                        <span class="truncate">{{ profile.social?.instagram || '—' }}</span>
                    </div>
                    <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-facebook</v-icon>
                        <span class="truncate">{{ profile.social?.facebook || '—' }}</span>
                    </div>
                    <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-linkedin</v-icon>
                        <span class="truncate">{{ profile.social?.linkedin || '—' }}</span>
                    </div>
                    </div>
                </div>
                </v-col>

                <v-col cols="12" md="6">
                <div class="kv">
                    <div class="kv__label">Brand Style</div>
                    <div class="kv__value">
                    <div class="swatch-line">
                        <span class="muted">Primary</span>
                        <span class="swatch" :style="{ background: profile.style?.primary_color || 'var(--brand-primary)' }"></span>
                        <code class="code-badge">{{ profile.style?.primary_color || '#5B9279' }}</code>
                    </div>
                    <div class="swatch-line">
                        <span class="muted">Secondary</span>
                        <span class="swatch" :style="{ background: profile.style?.secondary_color || 'var(--brand-secondary)' }"></span>
                        <code class="code-badge">{{ profile.style?.secondary_color || '#12130F' }}</code>
                    </div>
                    <div class="mt-2"><span class="muted">Tone</span> — {{ profile.style?.tone || '—' }}</div>
                    <div class="mt-1"><span class="muted">Packaging</span> — {{ profile.style?.packaging || '—' }}</div>
                    </div>
                </div>
                </v-col>
            </v-row>
            </v-card-text>
        </v-card>
        </v-col>
    </v-row>

    <!-- Wizard Dialog (Step-by-step setup) -->
    <brand-wizard
    v-model:open="wizardOpen"
    :initial-profile="profile"
    :completed="profileCompleted"
    :mode-title="wizardModeTitle"
    @save="onWizardSave"
    @cancel="() => (wizardOpen = false)"
  />
  </v-container>
</template>

<script setup>
/* Imports */
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import BrandWizard from './BrandWizard.vue'

/* Router, stores, injections */
const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const toast = inject('toast')?.show

/* State */
const loading = ref(false)
const saving = ref(false)
const wizardOpen = ref(false)

const brand = ref(null)     // { id, name, website, category, industry }
const profile = reactive({  // granular brand profile
  completed: false,
  logo: '',
  tagline: '',
  description: '',
  hq_location: '',
  contact_email: '',
  price_tier: '',                  // 'Budget' | 'Mid' | 'Premium' | 'Luxury'
  sales_channels: [],              // ['DTC ecom', 'Wholesale', 'Marketplaces', 'Retail']
  target_markets: [],              // ['US', 'Canada', 'EU', ...]
  categories: [],                  // ['Apparel', 'Footwear', 'Accessories', ...]
  wholesale: { moq: '', lead_time: '', case_pack: '' },
  fulfillment: '',                 // '3PL', 'In-house', 'Dropship'
  return_policy: '',               // '30 days', '14 days', 'Final sale'
  social: { instagram: '', facebook: '', linkedin: '' },
  style: { primary_color: '', secondary_color: '', tone: '', packaging: '' }
})

/* Mock logo fallback */
const placeholderLogo = 'https://dummyimage.com/240x240/eeeeee/aaaaaa.png&text=Logo'

/* Derived */
const profileCompleted = computed(() => !!profile.completed)
const wizardModeTitle = computed(() => (profileCompleted.value ? 'Edit Brand Profile' : 'Build Brand Profile'))

/* Wizard dialog state */
const wizard = reactive({ open: false })
const draft = reactive({}) // working copy of profile in the wizard
const stepIndex = ref(0)

/* Step descriptors (one question per step) */
const steps = [
  {
    key: 'tagline',
    title: 'What’s your short brand tagline?',
    help: 'Keep it punchy — one line that captures your vibe.',
    model: 'tagline',
    component: 'StepTextField',
    placeholder: 'e.g., Purpose-built outdoor apparel'
  },
  {
    key: 'price_tier',
    title: 'Where do your products sit price-wise?',
    help: 'Buyers use this to gauge fit in their assortments.',
    model: 'price_tier',
    component: 'StepChipGroup',
    options: ['Budget', 'Mid', 'Premium', 'Luxury']
  },
  {
    key: 'sales_channels',
    title: 'Which sales channels do you use?',
    help: 'Choose all that apply.',
    model: 'sales_channels',
    component: 'StepMultiChipGroup',
    options: ['DTC ecom', 'Wholesale', 'Marketplaces', 'Retail']
  },
  {
    key: 'target_markets',
    title: 'Where do you primarily sell?',
    help: 'Select main regions.',
    model: 'target_markets',
    component: 'StepMultiChipGroup',
    options: ['US', 'Canada', 'EU', 'UK', 'APAC']
  },
  {
    key: 'wholesale',
    title: 'Wholesale basics',
    help: 'Minimum order quantity, typical lead time, and case pack.',
    model: 'wholesale',
    component: 'StepWholesale'
  },
  {
    key: 'style',
    title: 'Brand style',
    help: 'Colors and tone help retailers present you correctly.',
    model: 'style',
    component: 'StepStyle'
  },
]

/* ---- Lifecycle ---- */
onMounted(async () => {
  await loadBrandAndProfile()
})

/* ---- API shims (duped style) ---- */
// These DO NOT touch your account creation page.
// They simply read the values that page already collected (name, website, category, industry)
// and fill the more granular `profile` with defaults you can enrich later.
async function apiFetchBrand() {
  // Simulate brand from your earlier join/create flows
  // Prefer user.value.brand if you already store it there.
  const brandFromUser = user.value?.brand
  if (brandFromUser?.id) return brandFromUser

  // fallback duped brand based on your example
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: 75848949,
        name: "Duffey's Dapper Duds",
        website: 'https://duffeysdapperduds.com',
        category: 'Product Brand (General)',
        industry: 'Apparel'
      })
    }, 400)
  })
}

async function apiFetchProfile(brandId) {
  // Start with an incomplete profile
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        completed: false,
        logo: '',
        tagline: '',
        description: '',
        hq_location: '',
        contact_email: '',
        price_tier: '',
        sales_channels: [],
        target_markets: [],
        categories: ['Apparel'],
        wholesale: { moq: '', lead_time: '', case_pack: '' },
        fulfillment: '',
        return_policy: '',
        social: { instagram: '', facebook: '', linkedin: '' },
        style: { primary_color: '', secondary_color: '', tone: '', packaging: '' }
      })
    }, 350)
  })
}

async function apiSaveProfile(brandId, payload) {
  // pretend save
  return new Promise(resolve => {
    setTimeout(() => resolve({ ok: true }), 500)
  })
}

/* ---- Loaders ---- */
async function loadBrandAndProfile() {
  loading.value = true
  try {
    const b = await apiFetchBrand()
    brand.value = b
    const p = await apiFetchProfile(b.id)
    Object.assign(profile, p)
  } finally {
    loading.value = false
  }
}

/* ---- Wizard controls ---- */
function openWizard() {
  wizardOpen.value = true
}

function closeWizard() {
  wizardOpen.value = false
}

function prevStep() {
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}

async function nextOrSave() {
  // persist current step’s answer back into draft (already bound via v-model)
  if (stepIndex.value < steps.length - 1) {
    stepIndex.value++
    return
  }
  // Final save
  await saveProfile()
}

async function saveProfile() {
  try {
    saving.value = true
    await apiSaveProfile(brand.value.id, draft)
    // commit to live profile
    Object.assign(profile, draft)
    profile.completed = computeCompletion(profile)
    toast?.({ message: 'Brand profile saved.' })
    closeWizard()
  } catch (e) {
    toast?.({ message: 'Could not save profile.', error: true })
  } finally {
    saving.value = false
  }
}

/* Simple completion heuristic */
function computeCompletion(p) {
  const mustHave = [
    p.tagline,
    p.price_tier,
    p.sales_channels?.length,
    p.target_markets?.length
  ]
  return mustHave.every(Boolean)
}

async function onWizardSave (draft) {
  // Here you persist to your API (or duped save),
  // then merge into the live `profile`.
  // Example:
  // await apiSaveProfile(brand.value.id, draft)
  Object.assign(profile, draft)
  profile.completed = computeCompletion(profile)
  toast?.({ message: 'Brand profile saved.' })
}
</script>

<style scoped>
:root {
  /* Brandora palette (fallbacks) */
  --brand-primary: #5B9279;
  --brand-secondary: #12130F;
  --brand-info: #8FCB9B;
  --brand-warning: #D64933;
  --brand-success: #EEF36A;
  --brand-translucent: rgba(255,255,255,0.2);
}

.product-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow:
    0 1px 1px rgba(0,0,0,0.02),
    0 8px 24px rgba(0,0,0,0.06);
}

.overview-card .v-card-title {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
}

.soft-divider {
  border-color: rgba(0,0,0,0.06) !important;
}

/* Key/Value rows */
.kv { }
.kv__label {
  font-size: 0.75rem;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
}
.kv__value {
  font-size: 0.95rem;
  color: rgba(0,0,0,0.86);
}

/* Subtle grid for triplets like MOQ/Lead/Pack */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}
@media (max-width: 960px) {
  .grid-2 { grid-template-columns: 1fr; }
}

/* Chips & empty pill */
.chip-tonal {
  background: rgba(91, 146, 121, 0.12);
  border: 1px solid rgba(91, 146, 121, 0.28);
}
.empty-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: rgba(0,0,0,0.55);
  border: 1px dashed rgba(0,0,0,0.25);
  background: rgba(0,0,0,0.02);
}

/* Meta rows (icons + text) */
.meta-line {
  display: flex;
  align-items: center;
  line-height: 1.3;
  margin-bottom: 6px;
  min-height: 28px;
}
.meta-line .v-icon { opacity: 0.7; }

/* Color swatches */
.swatch-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
}
.swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
}
.code-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: .75rem;
  padding: 2px 6px;
  background: rgba(0,0,0,0.04);
  color: rgba(0,0,0,0.8);
  border-radius: 6px;
}

/* Helpers */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.muted {
  color: rgba(0,0,0,0.56);
}
.table-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 10px;
}

</style>
