<!-- src/components/BrandProfile/OperationsSection.vue -->
<template>
  <v-card class="product-card">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2">mdi-cog-outline</v-icon>
      {{ title || 'Operations' }}
    </v-card-title>

    <v-card-text class="pt-0">
      <!-- EDIT MODE -->
      <v-row v-if="editable" dense>
        <!-- Wholesale Operations -->
        <template v-if="showWholesaleFields">
          <v-col cols="12">
            <div class="text-subtitle-2 mb-2">Wholesale Operations</div>
          </v-col>

          <v-col v-if="showField('moq')" cols="12" sm="4">
            <v-text-field
              :model-value="localWholesale.moq"
              @update:model-value="updateWholesaleField('moq', $event)"
              label="MOQ (Minimum Order Quantity)"
              placeholder="e.g., 24"
              type="number"
              density="comfortable"
            />
          </v-col>

          <v-col v-if="showField('leadTime')" cols="12" sm="4">
            <v-text-field
              :model-value="localWholesale.leadTime"
              @update:model-value="updateWholesaleField('leadTime', $event)"
              label="Lead Time"
              placeholder="e.g., 2–3 weeks"
              density="comfortable"
            />
          </v-col>

          <v-col v-if="showField('casePackSize')" cols="12" sm="4">
            <v-text-field
              :model-value="localWholesale.casePackSize"
              @update:model-value="updateWholesaleField('casePackSize', $event)"
              label="Case Pack Size"
              placeholder="e.g., 6"
              type="number"
              density="comfortable"
            />
          </v-col>
        </template>

        <!-- General Operations -->
        <template v-if="showOperationsFields">
          <v-col v-if="showWholesaleFields" cols="12">
            <v-divider class="my-2" />
          </v-col>

          <v-col v-if="showWholesaleFields" cols="12">
            <div class="text-subtitle-2 mb-2">General Operations</div>
          </v-col>

          <v-col v-if="showField('fulfillmentMethod')" cols="12">
            <div class="mb-2 text-caption text-uppercase">Fulfillment Method</div>
            <v-chip-group
              :model-value="localOperations.fulfillmentMethod"
              @update:model-value="updateOperationsField('fulfillmentMethod', $event)"
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

          <v-col v-if="showField('returnPolicy')" cols="12">
            <v-textarea
              :model-value="localOperations.returnPolicy"
              @update:model-value="updateOperationsField('returnPolicy', $event)"
              label="Return Policy"
              placeholder="Describe your return policy..."
              rows="3"
              auto-grow
              density="comfortable"
            />
          </v-col>
        </template>
      </v-row>

      <!-- DISPLAY MODE -->
      <v-row v-else dense>
        <!-- Wholesale Operations -->
        <v-col cols="12" md="6">
          <div class="kv">
            <div class="kv__label">Wholesale Operations</div>
            <div class="kv__value grid-2">
              <div>
                <span class="muted">MOQ</span>
                <strong class="ml-2">
                  {{ profile.wholesaleOperations?.moq || '—' }}
                </strong>
              </div>
              <div>
                <span class="muted">Lead Time</span>
                <strong class="ml-2">
                  {{ profile.wholesaleOperations?.leadTime || '—' }}
                </strong>
              </div>
              <div>
                <span class="muted">Case Pack Size</span>
                <strong class="ml-2">
                  {{ profile.wholesaleOperations?.casePackSize || '—' }}
                </strong>
              </div>
            </div>
          </div>
        </v-col>

        <!-- General Operations -->
        <v-col cols="12" md="6">
          <div class="kv">
            <div class="kv__label">Fulfillment Method</div>
            <div class="kv__value">
              <v-chip
                v-if="profile.operations?.fulfillmentMethod"
                size="small"
                label
                class="chip-tonal"
              >
                {{ formatFulfillmentMethod(profile.operations.fulfillmentMethod) }}
              </v-chip>
              <span v-else class="empty-pill">Not set</span>
            </div>
          </div>

          <div class="kv mt-4">
            <div class="kv__label">Return Policy</div>
            <div class="kv__value">
              {{ profile.operations?.returnPolicy || 'Not specified' }}
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
  wholesaleValue: {
    type: Object,
    default: () => ({})
  },
  operationsValue: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array,
    default: () => ['moq', 'leadTime', 'casePackSize', 'fulfillmentMethod', 'returnPolicy']
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:wholesaleValue', 'update:operationsValue'])

// Fulfillment options
const fulfillmentOptions = [
  { value: '3pl', label: '3PL / Third Party' },
  { value: 'in-house', label: 'In-House' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'dropship', label: 'Dropship' }
]

// Local values for editing
const localWholesale = computed(() => ({
  moq: undefined,
  leadTime: '',
  casePackSize: undefined,
  ...props.wholesaleValue
}))

const localOperations = computed(() => ({
  fulfillmentMethod: '',
  returnPolicy: '',
  ...props.operationsValue
}))

// Helper to check if field should be shown
function showField(fieldName) {
  return props.fields.includes(fieldName)
}

// Check if we should show wholesale section
const showWholesaleFields = computed(() => {
  return ['moq', 'leadTime', 'casePackSize'].some(f => props.fields.includes(f))
})

// Check if we should show operations section
const showOperationsFields = computed(() => {
  return ['fulfillmentMethod', 'returnPolicy'].some(f => props.fields.includes(f))
})

// Update wholesale field
function updateWholesaleField(field, value) {
  emit('update:wholesaleValue', { ...localWholesale.value, [field]: value })
}

// Update operations field
function updateOperationsField(field, value) {
  emit('update:operationsValue', { ...localOperations.value, [field]: value })
}

// Format fulfillment method for display
function formatFulfillmentMethod(method) {
  const methods = {
    '3pl': '3PL / Third Party',
    'in-house': 'In-House Warehouse',
    'hybrid': 'Hybrid (3PL + In-House)',
    'dropship': 'Dropship'
  }
  return methods[method] || method
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

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

@media (max-width: 960px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.muted {
  color: rgba(0,0,0,0.56);
  font-size: 0.85rem;
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