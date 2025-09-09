<template>
  <v-dialog v-model="isOpen" max-width="820">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-h6">{{ modeTitle }}</div>
        <v-chip size="small" label :color="completed ? 'success' : 'warning'">
          {{ completed ? 'Complete' : 'Incomplete' }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-1">
          Step {{ stepIndex + 1 }} of {{ totalSteps }}
        </div>

        <!-- STEP 1: Tagline -->
        <template v-if="stepIndex === 0">
          <div class="text-h6 mb-2">What’s your short brand tagline?</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Keep it punchy — one line that captures your vibe.
          </div>
          <v-text-field
            v-model="draft.tagline"
            placeholder="e.g., Purpose-built outdoor apparel"
            autofocus
          />
        </template>

        <!-- STEP 2: Price tier -->
        <template v-else-if="stepIndex === 1">
          <div class="text-h6 mb-2">Where do your products sit price-wise?</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Buyers use this to gauge fit in their assortments.
          </div>
          <v-chip-group v-model="draft.price_tier" mandatory selected-class="text-primary font-weight-medium">
            <v-chip v-for="o in priceTierOptions" :key="o" :value="o" label variant="elevated" class="mr-2 mb-2">
              {{ o }}
            </v-chip>
          </v-chip-group>
        </template>

        <!-- STEP 3: Sales channels -->
        <template v-else-if="stepIndex === 2">
          <div class="text-h6 mb-2">Which sales channels do you use?</div>
          <div class="text-body-2 text-medium-emphasis mb-4">Choose all that apply.</div>
          <div>
            <v-chip
              v-for="o in salesChannelOptions"
              :key="o"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(draft.sales_channels || []).includes(o) ? 'primary' : undefined"
              @click="toggleArrayField('sales_channels', o)"
            >
              {{ o }}
            </v-chip>
          </div>
        </template>

        <!-- STEP 4: Target markets -->
        <template v-else-if="stepIndex === 3">
          <div class="text-h6 mb-2">Where do you primarily sell?</div>
          <div class="text-body-2 text-medium-emphasis mb-4">Select main regions.</div>
          <div>
            <v-chip
              v-for="o in marketOptions"
              :key="o"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(draft.target_markets || []).includes(o) ? 'primary' : undefined"
              @click="toggleArrayField('target_markets', o)"
            >
              {{ o }}
            </v-chip>
          </div>
        </template>

        <!-- STEP 5: Wholesale basics -->
        <template v-else-if="stepIndex === 4">
          <div class="text-h6 mb-2">Wholesale basics</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Minimum order quantity, typical lead time, and case pack.
          </div>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field label="MOQ" v-model="draft.wholesale.moq" placeholder="e.g., 24 units" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field label="Lead Time" v-model="draft.wholesale.lead_time" placeholder="e.g., 2–3 weeks" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field label="Case Pack" v-model="draft.wholesale.case_pack" placeholder="e.g., 6" />
            </v-col>
          </v-row>
        </template>

        <!-- STEP 6: Brand style -->
        <template v-else-if="stepIndex === 5">
          <div class="text-h6 mb-2">Brand style</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Colors and tone help retailers present you correctly.
          </div>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field label="Primary Color (hex)" v-model="draft.style.primary_color" placeholder="#5B9279" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Secondary Color (hex)" v-model="draft.style.secondary_color" placeholder="#12130F" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Tone" v-model="draft.style.tone" placeholder="e.g., Playful, Minimal, Technical" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Packaging Notes" v-model="draft.style.packaging" placeholder="e.g., Recyclable kraft boxes" />
            </v-col>
          </v-row>
        </template>

        <!-- STEP 7: Brand socials -->
        <template v-else-if="stepIndex === 6">
          <div class="text-h6 mb-2">Brand Social Media</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Colors and tone help retailers present you correctly.
          </div>
          <v-row dense>
            <v-col cols="12" sm="8">
            <v-text-field
              label="Instagram"
              v-model="draft.socials.instagram"
              placeholder="e.g., @yourbrand or https://instagram.com/yourbrand"
              prepend-inner-icon="mdi-instagram"
              clearable
            />
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field
              label="Facebook"
              v-model="draft.socials.facebook"
              placeholder="e.g., yourbrandpage or https://facebook.com/yourbrandpage"
              prepend-inner-icon="mdi-facebook"
              clearable
            />
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field
              label="LinkedIn"
              v-model="draft.socials.linkedin"
              placeholder="e.g., company/yourbrand or https://linkedin.com/company/yourbrand"
              prepend-inner-icon="mdi-linkedin"
              clearable
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
const totalSteps = 7

/* Options */
const priceTierOptions = ['Budget', 'Mid', 'Premium', 'Luxury']
const salesChannelOptions = ['DTC ecom', 'Wholesale', 'Marketplaces', 'Retail']
const marketOptions = ['US', 'Canada', 'EU', 'UK', 'APAC']

/* Working copy */
const draft = reactive({
  tagline: '',
  price_tier: '',
  sales_channels: [],
  target_markets: [],
  wholesale: { moq: '', lead_time: '', case_pack: '' },
  style: { primary_color: '', secondary_color: '', tone: '', packaging: '' },
  socials: {instagram: '', facebook: '', linkedin: '' }
})

/* Hydrate draft when opened / profile changes */
function resetDraftFromProps () {
  const src = props.initialProfile || {}
  // Deep-ish clone with defaults so v-models always have something to bind to
  draft.tagline = src.tagline || ''
  draft.price_tier = src.price_tier || ''
  draft.sales_channels = Array.isArray(src.sales_channels) ? [...src.sales_channels] : []
  draft.target_markets = Array.isArray(src.target_markets) ? [...src.target_markets] : []
  draft.wholesale = {
    moq: src.wholesale?.moq || '',
    lead_time: src.wholesale?.lead_time || '',
    case_pack: src.wholesale?.case_pack || ''
  }
  draft.style = {
    primary_color: src.style?.primary_color || '',
    secondary_color: src.style?.secondary_color || '',
    tone: src.style?.tone || '',
    packaging: src.style?.packaging || ''
  }
  draft.socials = {
    instagram: src.socials?.instagram || '',
    facebook: src.socials?.facebook || '',
    linkedin: src.socials?.linkedin || ''
  }
  stepIndex.value = 0
}
watch(() => props.initialProfile, resetDraftFromProps, { deep: true, immediate: true })
watch(() => props.open, (o) => { if (o) resetDraftFromProps() })

/* Helpers */
function toggleArrayField (key, value) {
  const arr = draft[key] || (draft[key] = [])
  const i = arr.indexOf(value)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(value)
}

/* Nav & actions */
function onCancel () {
  isOpen.value = false
  emit('cancel')
}
function prevStep () {
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}
async function nextOrSave () {
  if (stepIndex.value < totalSteps - 1) {
    stepIndex.value++
    return
  }
  await onSave()
}
async function onSave () {
  try {
    saving.value = true
    // Send a deep clone to parent
    emit('save', JSON.parse(JSON.stringify(draft)))
    isOpen.value = false
  } finally {
    saving.value = false
  }
}
</script>
<style scoped></style>