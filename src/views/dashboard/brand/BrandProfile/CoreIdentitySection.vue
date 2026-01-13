<!-- src/components/BrandProfile/CoreIdentitySection.vue -->
<template>
  <v-card class="product-card">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2">mdi-text-box-outline</v-icon>
      {{ title || 'Core Identity' }}
    </v-card-title>

    <v-card-text class="pt-0">
      <!-- EDIT MODE -->
      <v-row v-if="editable" dense>
        <!-- Tagline -->
        <v-col v-if="showField('tagline')" cols="12">
          <v-text-field
            :model-value="localValue.tagline"
            @update:model-value="updateField('tagline', $event)"
            label="Tagline"
            placeholder="e.g., Purpose-built outdoor apparel"
            density="comfortable"
          />
        </v-col>

        <!-- Description -->
        <v-col v-if="showField('description')" cols="12">
          <v-textarea
            :model-value="localValue.description"
            @update:model-value="updateField('description', $event)"
            label="Brand Description"
            placeholder="Brief description of your brand and products"
            rows="3"
            auto-grow
            density="comfortable"
          />
        </v-col>

        <!-- Product Category -->
        <v-col v-if="showField('productCategory')" cols="12" sm="6">
          <v-text-field
            :model-value="localValue.productCategory"
            @update:model-value="updateField('productCategory', $event)"
            label="Product Category"
            placeholder="e.g., Men's Apparel"
            density="comfortable"
          />
        </v-col>

        <!-- Industry -->
        <v-col v-if="showField('industry')" cols="12" sm="6">
          <v-text-field
            :model-value="localValue.industry"
            @update:model-value="updateField('industry', $event)"
            label="Industry"
            placeholder="e.g., Fashion"
            density="comfortable"
          />
        </v-col>

        <!-- Categories -->
        <v-col v-if="showField('categories')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Categories</div>
          <div>
            <v-chip
              v-for="cat in categoryOptions"
              :key="cat"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(localValue.categories || []).includes(cat) ? 'primary' : undefined"
              @click="toggleCategory(cat)"
            >
              {{ cat }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- DISPLAY MODE -->
      <v-row v-else dense>
        <v-col cols="12">
          <div class="kv">
            <div class="kv__label">Brand Description</div>
            <div class="kv__value clamp-4">
              {{ profile.coreIdentity?.description || 'Add a description about your brand and products.' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Product Category</div>
            <div class="kv__value">
              {{ profile.coreIdentity?.productCategory || '—' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="kv">
            <div class="kv__label">Industry</div>
            <div class="kv__value">
              {{ profile.coreIdentity?.industry || '—' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <div class="kv">
            <div class="kv__label">Categories</div>
            <div class="kv__value">
              <template v-if="profile.coreIdentity?.categories?.length">
                <v-chip
                  v-for="cat in profile.coreIdentity.categories"
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
    default: () => ['tagline', 'description', 'productCategory', 'industry', 'categories']
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// Category options
const categoryOptions = [
  'Retail',
  'Apparel',
  'E-commerce',
  'Wholesale',
  'Manufacturing',
  'Beauty',
  'Home & Living',
  'Sports & Outdoors',
  'Technology'
]

// Local value for editing
const localValue = computed(() => ({
  tagline: '',
  description: '',
  productCategory: '',
  industry: '',
  categories: [],
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

// Toggle category
function toggleCategory(cat) {
  const categories = [...(localValue.value.categories || [])]
  const index = categories.indexOf(cat)
  
  if (index >= 0) {
    categories.splice(index, 1)
  } else {
    categories.push(cat)
  }
  
  emit('update:modelValue', { ...localValue.value, categories })
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

.clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
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