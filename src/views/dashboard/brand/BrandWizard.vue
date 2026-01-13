<template>
  <v-dialog v-model="isOpen" max-width="900" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-h6">{{ modeTitle }}</div>
        <v-chip size="small" label :color="completed ? 'success' : 'warning'">
          {{ completed ? 'Complete' : 'Incomplete' }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 600px;">
        <div class="text-caption text-medium-emphasis mb-4">
          Step {{ stepIndex + 1 }} of {{ totalSteps }}
        </div>

        <!-- STEP 1: Core Identity -->
        <template v-if="stepIndex === 0">
          <div class="text-h6 mb-2">Core Identity</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Tell us about your brand fundamentals.
          </div>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="draft.coreIdentity.tagline"
                label="Tagline"
                placeholder="e.g., Purpose-built outdoor apparel"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="draft.coreIdentity.description"
                label="Description"
                placeholder="Brief description of your brand and products"
                rows="3"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.coreIdentity.productCategory"
                label="Product Category"
                placeholder="e.g., Men's Apparel"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.coreIdentity.industry"
                label="Industry"
                placeholder="e.g., Fashion"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Categories</div>
              <div>
                <v-chip
                  v-for="cat in categoryOptions"
                  :key="cat"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                  :color="draft.coreIdentity.categories.includes(cat) ? 'primary' : undefined"
                  @click="toggleArray(draft.coreIdentity.categories, cat)"
                >
                  {{ cat }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- STEP 2: Market Positioning -->
        <template v-else-if="stepIndex === 1">
          <div class="text-h6 mb-2">Market Positioning</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Define how you position in the market.
          </div>
          <v-row dense>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Price Tier</div>
              <v-chip-group
                v-model="draft.marketPositioning.priceTier"
                mandatory
                selected-class="text-primary font-weight-medium"
              >
                <v-chip
                  v-for="tier in priceTierOptions"
                  :key="tier.value"
                  :value="tier.value"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                >
                  {{ tier.label }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Sales Channels</div>
              <div>
                <v-chip
                  v-for="channel in salesChannelOptions"
                  :key="channel"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                  :color="draft.marketPositioning.salesChannels.includes(channel) ? 'primary' : undefined"
                  @click="toggleArray(draft.marketPositioning.salesChannels, channel)"
                >
                  {{ channel }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Target Markets</div>
              <div>
                <v-chip
                  v-for="market in targetMarketOptions"
                  :key="market"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                  :color="draft.marketPositioning.targetMarkets.includes(market) ? 'primary' : undefined"
                  @click="toggleArray(draft.marketPositioning.targetMarkets, market)"
                >
                  {{ market }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- STEP 3: Wholesale Operations -->
        <template v-else-if="stepIndex === 2">
          <div class="text-h6 mb-2">Wholesale Operations</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Minimum order quantity, typical lead time, and case pack.
          </div>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="draft.wholesaleOperations.moq"
                label="MOQ (Minimum Order Quantity)"
                placeholder="e.g., 24"
                type="number"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="draft.wholesaleOperations.leadTime"
                label="Lead Time"
                placeholder="e.g., 2–3 weeks"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="draft.wholesaleOperations.casePackSize"
                label="Case Pack Size"
                placeholder="e.g., 6"
                type="number"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </template>

        <!-- STEP 4: Operations -->
        <template v-else-if="stepIndex === 3">
          <div class="text-h6 mb-2">General Operations</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Fulfillment method and return policy.
          </div>
          <v-row dense>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Fulfillment Method</div>
              <v-chip-group
                v-model="draft.operations.fulfillmentMethod"
                mandatory
                selected-class="text-primary font-weight-medium"
              >
                <v-chip
                  v-for="method in fulfillmentOptions"
                  :key="method.value"
                  :value="method.value"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                >
                  {{ method.label }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="draft.operations.returnPolicy"
                label="Return Policy"
                placeholder="Describe your return policy..."
                rows="3"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </template>

        <!-- STEP 5: Brand Style -->
        <template v-else-if="stepIndex === 4">
          <div class="text-h6 mb-2">Brand Style</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Colors and tone help retailers present you correctly.
          </div>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.brandStyle.primaryColor"
                label="Primary Color (hex)"
                placeholder="#5B9279"
                density="comfortable"
              >
                <template #prepend-inner>
                  <div
                    class="color-preview"
                    :style="{ background: draft.brandStyle.primaryColor || '#5B9279' }"
                  />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.brandStyle.secondaryColor"
                label="Secondary Color (hex)"
                placeholder="#12130F"
                density="comfortable"
              >
                <template #prepend-inner>
                  <div
                    class="color-preview"
                    :style="{ background: draft.brandStyle.secondaryColor || '#12130F' }"
                  />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12">
              <div class="mb-2 text-body-2">Brand Tone</div>
              <div>
                <v-chip
                  v-for="tone in brandToneOptions"
                  :key="tone"
                  label
                  variant="elevated"
                  class="mr-2 mb-2"
                  :color="draft.brandStyle.brandTone.includes(tone) ? 'primary' : undefined"
                  @click="toggleArray(draft.brandStyle.brandTone, tone)"
                >
                  {{ tone }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="draft.brandStyle.packagingStyle"
                label="Packaging Style"
                placeholder="e.g., Recyclable kraft boxes"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </template>

        <!-- STEP 6: Social Media -->
        <template v-else-if="stepIndex === 5">
          <div class="text-h6 mb-2">Social Media</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Connect your social media accounts.
          </div>
          <v-row dense>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.instagram"
                label="Instagram"
                placeholder="e.g., @yourbrand"
                prepend-inner-icon="mdi-instagram"
                clearable
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.facebook"
                label="Facebook"
                placeholder="e.g., yourbrandpage"
                prepend-inner-icon="mdi-facebook"
                clearable
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.linkedin"
                label="LinkedIn"
                placeholder="e.g., company/yourbrand"
                prepend-inner-icon="mdi-linkedin"
                clearable
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.twitter"
                label="Twitter / X"
                placeholder="e.g., @yourbrand"
                prepend-inner-icon="mdi-twitter"
                clearable
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.youtube"
                label="YouTube"
                placeholder="e.g., @yourbrand"
                prepend-inner-icon="mdi-youtube"
                clearable
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.socialMedia.tiktok"
                label="TikTok"
                placeholder="e.g., @yourbrand"
                prepend-inner-icon="mdi-music-note"
                clearable
                density="comfortable"
              />
            </v-col>
          </v-row>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-space-between">
        <div class="text-caption text-medium-emphasis">You can edit these anytime.</div>
        <div class="d-flex ga-2">
          <v-btn variant="text" @click="onCancel">Cancel</v-btn>
          <v-btn variant="tonal" :disabled="stepIndex === 0" @click="prevStep">Back</v-btn>
          <v-btn color="primary" @click="nextOrSave" :loading="saving">
            {{ stepIndex === totalSteps - 1 ? 'Save Profile' : 'Next' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

/* Props / Emits */
const props = defineProps({
  open: { type: Boolean, default: false },
  initialProfile: { type: Object, required: true },
  completed: { type: Boolean, default: false },
  modeTitle: { type: String, default: 'Build Brand Profile' }
})
const emit = defineEmits(['update:open', 'save', 'cancel'])

/* Dialog v-model */
const isOpen = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

/* State */
const saving = ref(false)
const stepIndex = ref(0)
const totalSteps = 6

/* Options */
const categoryOptions = [
  'Retail', 'Apparel', 'E-commerce', 'Wholesale', 'Manufacturing',
  'Beauty', 'Home & Living', 'Sports & Outdoors', 'Technology'
]

const priceTierOptions = [
  { value: 'discount', label: 'Discount' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid-tier', label: 'Mid-Tier' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' }
]

const salesChannelOptions = ['DTC ecom', 'Wholesale', 'Marketplaces', 'Retail', 'B2B']
const targetMarketOptions = ['US', 'Canada', 'EU', 'UK', 'APAC', 'Latin America', 'Middle East', 'Africa']

const fulfillmentOptions = [
  { value: '3pl', label: '3PL / Third Party' },
  { value: 'in-house', label: 'In-House' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'dropship', label: 'Dropship' }
]

const brandToneOptions = [
  'Professional', 'Friendly', 'Playful', 'Minimal', 'Technical',
  'Luxury', 'Casual', 'Bold', 'Sophisticated', 'Edgy'
]

/* Working copy - NESTED STRUCTURE matching backend model */
const draft = reactive({
  coreIdentity: {
    brandName: '',
    logo: '',
    tagline: '',
    description: '',
    productCategory: '',
    industry: '',
    categories: [],
    hqLocation: '',
    contactEmail: '',
    website: '',
    foundingYear: undefined
  },
  marketPositioning: {
    priceTier: '',
    salesChannels: [],
    targetMarkets: [],
    productCategories: []
  },
  wholesaleOperations: {
    moq: undefined,
    leadTime: '',
    casePackSize: undefined
  },
  operations: {
    fulfillmentMethod: '',
    returnPolicy: ''
  },
  brandStyle: {
    primaryColor: '',
    secondaryColor: '',
    brandTone: [],
    packagingStyle: ''
  },
  socialMedia: {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  }
})

/* Hydrate draft when opened / profile changes */
function resetDraftFromProps() {
  const src = props.initialProfile || {}
  // Handle BOTH old flat structure AND new nested structure
  // Core Identity
  Object.assign(draft.coreIdentity, {
    brandName: src.coreIdentity?.brandName || src.brandName || '',
    logo: src.coreIdentity?.logo || src.logo || '',
    tagline: src.coreIdentity?.tagline || src.tagline || '',
    description: src.coreIdentity?.description || src.description || '',
    productCategory: src.coreIdentity?.productCategory || src.productCategory || '',
    industry: src.coreIdentity?.industry || src.industry || '',
    categories: Array.isArray(src.coreIdentity?.categories) 
      ? [...src.coreIdentity.categories] 
      : Array.isArray(src.categories) 
        ? [...src.categories] 
        : [],
    hqLocation: src.coreIdentity?.hqLocation || src.hqLocation || '',
    contactEmail: src.coreIdentity?.contactEmail || src.contactEmail || '',
    website: src.coreIdentity?.website || src.website || '',
    foundingYear: src.coreIdentity?.foundingYear || src.foundingYear || undefined
  })

  // Market Positioning - handle old flat structure (price_tier, sales_channels, target_markets)
  Object.assign(draft.marketPositioning, {
    priceTier: src.marketPositioning?.priceTier || src.price_tier || '',
    salesChannels: Array.isArray(src.marketPositioning?.salesChannels) 
      ? [...src.marketPositioning.salesChannels] 
      : Array.isArray(src.sales_channels)
        ? [...src.sales_channels]
        : [],
    targetMarkets: Array.isArray(src.marketPositioning?.targetMarkets) 
      ? [...src.marketPositioning.targetMarkets] 
      : Array.isArray(src.target_markets)
        ? [...src.target_markets]
        : [],
    productCategories: Array.isArray(src.marketPositioning?.productCategories) 
      ? [...src.marketPositioning.productCategories] 
      : []
  })

  // Wholesale Operations - handle old flat structure (wholesale.moq, wholesale.lead_time, wholesale.case_pack)
  Object.assign(draft.wholesaleOperations, {
    moq: src.wholesaleOperations?.moq || src.wholesale?.moq || undefined,
    leadTime: src.wholesaleOperations?.leadTime || src.wholesale?.lead_time || '',
    casePackSize: src.wholesaleOperations?.casePackSize || src.wholesale?.case_pack || undefined
  })

  // Operations - handle old flat structure (fulfillment, return_policy)
  Object.assign(draft.operations, {
    fulfillmentMethod: src.operations?.fulfillmentMethod || src.fulfillment || '',
    returnPolicy: src.operations?.returnPolicy || src.return_policy || ''
  })

  // Brand Style - handle old flat structure (style.primary_color, style.secondary_color, style.tone, style.packaging)
  Object.assign(draft.brandStyle, {
    primaryColor: src.brandStyle?.primaryColor || src.style?.primary_color || '',
    secondaryColor: src.brandStyle?.secondaryColor || src.style?.secondary_color || '',
    brandTone: Array.isArray(src.brandStyle?.brandTone) 
      ? [...src.brandStyle.brandTone] 
      : src.style?.tone
        ? [src.style.tone]
        : [],
    packagingStyle: src.brandStyle?.packagingStyle || src.style?.packaging || ''
  })

  // Social Media - handle old flat structure (socials.instagram, socials.facebook, etc.)
  Object.assign(draft.socialMedia, {
    instagram: src.socialMedia?.instagram || src.socials?.instagram || '',
    facebook: src.socialMedia?.facebook || src.socials?.facebook || '',
    linkedin: src.socialMedia?.linkedin || src.socials?.linkedin || '',
    twitter: src.socialMedia?.twitter || src.socials?.twitter || '',
    youtube: src.socialMedia?.youtube || src.socials?.youtube || '',
    tiktok: src.socialMedia?.tiktok || src.socials?.tiktok || ''
  })

  stepIndex.value = 0
}

watch(() => props.initialProfile, resetDraftFromProps, { deep: true, immediate: true })
watch(() => props.open, (o) => { 
  if (o) {
    resetDraftFromProps()
  }
})

/* Helpers */
function toggleArray(arr, value) {
  const index = arr.indexOf(value)
  if (index >= 0) {
    arr.splice(index, 1)
  } else {
    arr.push(value)
  }
}

/* Nav & actions */
function onCancel() {
  isOpen.value = false
  emit('cancel')
}

function prevStep() {
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}

async function nextOrSave() {
  if (stepIndex.value < totalSteps - 1) {
    stepIndex.value++
    return
  }
  await onSave()
}

async function onSave() {
  try {
    saving.value = true
    // Send a deep clone to parent with proper nested structure
    emit('save', JSON.parse(JSON.stringify(draft)))
    isOpen.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
  margin-right: 8px;
}
</style>