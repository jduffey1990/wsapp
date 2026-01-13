<!-- src/components/BrandProfile/MarketPositioningSection.vue -->
<template>
  <v-card class="product-card">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      {{ title || 'Market Positioning' }}
    </v-card-title>

    <v-card-text class="pt-0">
      <!-- EDIT MODE -->
      <v-row v-if="editable" dense>
        <!-- Price Tier -->
        <v-col v-if="showField('priceTier')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Price Tier</div>
          <v-chip-group
            :model-value="localValue.priceTier"
            @update:model-value="updateField('priceTier', $event)"
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

        <!-- Sales Channels -->
        <v-col v-if="showField('salesChannels')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Sales Channels</div>
          <div>
            <v-chip
              v-for="channel in salesChannelOptions"
              :key="channel"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(localValue.salesChannels || []).includes(channel) ? 'primary' : undefined"
              @click="toggleArrayField('salesChannels', channel)"
            >
              {{ channel }}
            </v-chip>
          </div>
        </v-col>

        <!-- Target Markets -->
        <v-col v-if="showField('targetMarkets')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Target Markets</div>
          <div>
            <v-chip
              v-for="market in targetMarketOptions"
              :key="market"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(localValue.targetMarkets || []).includes(market) ? 'primary' : undefined"
              @click="toggleArrayField('targetMarkets', market)"
            >
              {{ market }}
            </v-chip>
          </div>
        </v-col>

        <!-- Product Categories -->
        <v-col v-if="showField('productCategories')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Product Categories</div>
          <div>
            <v-chip
              v-for="category in productCategoryOptions"
              :key="category"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(localValue.productCategories || []).includes(category) ? 'primary' : undefined"
              @click="toggleArrayField('productCategories', category)"
            >
              {{ category }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- DISPLAY MODE -->
      <v-row v-else dense>
        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Price Tier</div>
            <div class="kv__value">
              <v-chip
                v-if="profile.marketPositioning?.priceTier"
                size="small"
                label
                class="chip-tonal"
              >
                {{ formatPriceTier(profile.marketPositioning.priceTier) }}
              </v-chip>
              <span v-else class="empty-pill">Not set</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Sales Channels</div>
            <div class="kv__value">
              <template v-if="profile.marketPositioning?.salesChannels?.length">
                <v-chip
                  v-for="channel in profile.marketPositioning.salesChannels"
                  :key="channel"
                  size="x-small"
                  class="mr-1 mb-1 chip-tonal"
                  label
                >
                  {{ channel }}
                </v-chip>
              </template>
              <span v-else class="empty-pill">No channels</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Target Markets</div>
            <div class="kv__value">
              <template v-if="profile.marketPositioning?.targetMarkets?.length">
                <v-chip
                  v-for="market in profile.marketPositioning.targetMarkets"
                  :key="market"
                  size="x-small"
                  class="mr-1 mb-1 chip-tonal"
                  label
                >
                  {{ market }}
                </v-chip>
              </template>
              <span v-else class="empty-pill">No markets</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Product Categories</div>
            <div class="kv__value">
              <template v-if="profile.marketPositioning?.productCategories?.length">
                <v-chip
                  v-for="cat in profile.marketPositioning.productCategories"
                  :key="cat"
                  size="x-small"
                  class="mr-1 mb-1 chip-tonal"
                  label
                >
                  {{ cat }}
                </v-chip>
              </template>
              <span v-else class="empty-pill">No categories</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array,
    default: () => ['priceTier', 'salesChannels', 'targetMarkets', 'productCategories']
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// Options
const priceTierOptions = [
  { value: 'discount', label: 'Discount' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid-tier', label: 'Mid-Tier' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' }
]

const salesChannelOptions = [
  'DTC ecom',
  'Wholesale',
  'Marketplaces',
  'Retail',
  'B2B'
]

const targetMarketOptions = [
  'US',
  'Canada',
  'EU',
  'UK',
  'APAC',
  'Latin America',
  'Middle East',
  'Africa'
]

const productCategoryOptions = [
  'Apparel',
  'Accessories',
  'Footwear',
  'Beauty',
  'Home & Living',
  'Sports & Outdoors',
  'Electronics',
  'Food & Beverage',
  'Health & Wellness'
]

// Local value for editing
const localValue = computed(() => ({
  priceTier: '',
  salesChannels: [],
  targetMarkets: [],
  productCategories: [],
  ...props.modelValue
}))

// Helper to check if field should be shown
function showField(fieldName) {
  return props.fields.includes(fieldName)
}

// Update field and emit
function updateField(field, value) {
  emit('update:modelValue', { ...localValue.value, [field]: value })
}

// Toggle array field
function toggleArrayField(key, value) {
  const arr = [...(localValue.value[key] || [])]
  const index = arr.indexOf(value)
  
  if (index >= 0) {
    arr.splice(index, 1)
  } else {
    arr.push(value)
  }
  
  emit('update:modelValue', { ...localValue.value, [key]: arr })
}

// Format price tier for display
function formatPriceTier(tier) {
  const tiers = {
    'discount': 'Discount',
    'entry': 'Entry Level',
    'mid-tier': 'Mid-Tier',
    'premium': 'Premium',
    'luxury': 'Luxury'
  }
  return tiers[tier] || tier
}
</script>

<style scoped>
.product-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.product-card .v-card-title {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
}

.kv__label {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
}

.kv__value {
  font-size: 0.95rem;
  color: rgba(0,0,0,0.86);
}

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
</style>