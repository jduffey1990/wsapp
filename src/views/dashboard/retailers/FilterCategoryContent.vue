<!-- src/views/dashboard/retailers/FilterCategoryContent.vue -->
<!-- Shared filter UI content used by both FilterConfigurationPage and RetailerFilters -->

<template>
  <v-expansion-panels 
    :multiple="multiple" 
    variant="accordion"
    :model-value="expandedPanels"
    @update:model-value="$emit('update:expandedPanels', $event)"
  >
    <!-- Location Filters -->
    <v-expansion-panel value="location">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-map-marker</v-icon>
        Location
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- Region Quick Select -->
        <div class="mb-3">
          <label class="text-caption text-medium-emphasis mb-2 d-block">
            Quick Select by Region
          </label>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="region in regionMapping"
              :key="region.name"
              :variant="isRegionSelected(region) ? 'flat' : 'outlined'"
              :color="isRegionSelected(region) ? 'primary' : 'default'"
              size="small"
              @click="toggleRegion(region)"
            >
              {{ region.name }}
            </v-chip>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- State Selection -->
        <v-select
          :model-value="localFilters.state"
          :items="filterOptions.states"
          label="States"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('state', $event)"
        >
          <template #prepend-item>
            <v-list-item>
              <v-list-item-title class="text-caption text-medium-emphasis">
                {{ localFilters.state?.length || 0 }} state{{ localFilters.state?.length !== 1 ? 's' : '' }} selected
              </v-list-item-title>
            </v-list-item>
            <v-divider class="mb-2" />
          </template>
        </v-select>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Retailer Type Filters -->
    <v-expansion-panel value="retailerType">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-store</v-icon>
        Retailer Type
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-select
          :model-value="localFilters.retailerType"
          :items="filterOptions.retailerTypes"
          label="Type"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('retailerType', $event)"
        />

        <v-text-field
          :model-value="localFilters.minLocations"
          label="Min Locations"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
          @update:model-value="updateFilter('minLocations', $event)"
        />

        <v-text-field
          :model-value="localFilters.maxLocations"
          label="Max Locations"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('maxLocations', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Price Point -->
    <v-expansion-panel value="pricePoint">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-currency-usd</v-icon>
        Price Point
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-select
          :model-value="localFilters.pricePoint"
          :items="filterOptions.pricePoints"
          label="Price Category"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('pricePoint', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Target Demographics -->
    <v-expansion-panel value="demographics">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-account-group</v-icon>
        Target Demographics
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-select
          :model-value="localFilters.targetGender"
          :items="['Men', 'Women', 'Unisex']"
          label="Gender"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('targetGender', $event)"
        />

        <v-select
          :model-value="localFilters.targetAgeGroup"
          :items="['18-24', '25-34', '35-44', '45-54', '55+']"
          label="Age Group"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('targetAgeGroup', $event)"
        />

        <v-slider
          :model-value="localFilters.minRating"
          label="Min Rating"
          :min="0"
          :max="5"
          :step="0.5"
          thumb-label
          show-ticks
          class="mt-4"
          @update:model-value="updateFilter('minRating', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Product Categories -->
    <v-expansion-panel value="productCategories">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-hanger</v-icon>
        Product Categories
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-select
          :model-value="localFilters.categories"
          :items="filterOptions.categories"
          label="Categories"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('categories', $event)"
        />

        <v-text-field
          :model-value="localFilters.minMSRP"
          label="Min MSRP"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
          @update:model-value="updateFilter('minMSRP', $event)"
        />

        <v-text-field
          :model-value="localFilters.maxMSRP"
          label="Max MSRP"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('maxMSRP', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Aesthetic -->
    <v-expansion-panel value="aesthetic">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-palette</v-icon>
        Aesthetic
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-select
          :model-value="localFilters.aesthetics"
          :items="filterOptions.aesthetics"
          label="Aesthetics"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('aesthetics', $event)"
        />

        <v-select
          :model-value="localFilters.seasonality"
          :items="['Spring/Summer', 'Fall/Winter', 'Year-Round']"
          label="Seasonality"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('seasonality', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Financial -->
    <v-expansion-panel value="financial">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        Financial
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-text-field
          :model-value="localFilters.minRevenue"
          label="Min Annual Revenue"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
          @update:model-value="updateFilter('minRevenue', $event)"
        />

        <v-text-field
          :model-value="localFilters.maxRevenue"
          label="Max Annual Revenue"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('maxRevenue', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Buying Terms -->
    <v-expansion-panel value="buyingTerms">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-handshake</v-icon>
        Buying Terms
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-text-field
          :model-value="localFilters.minOrderSize"
          label="Min Opening Order"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
          @update:model-value="updateFilter('minOrderSize', $event)"
        />

        <v-text-field
          :model-value="localFilters.maxOrderSize"
          label="Max Opening Order"
          type="number"
          prefix="$"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('maxOrderSize', $event)"
        />

        <v-select
          :model-value="localFilters.otbStrategy"
          :items="filterOptions.otbStrategies"
          label="OTB Strategy"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          @update:model-value="updateFilter('otbStrategy', $event)"
        />

        <v-select
          :model-value="localFilters.paymentTerms"
          :items="filterOptions.paymentTerms"
          label="Payment Terms"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateFilter('paymentTerms', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <!-- Operations -->
    <v-expansion-panel value="operations">
      <v-expansion-panel-title>
        <v-icon class="mr-2">mdi-cog</v-icon>
        Operations
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-checkbox
          :model-value="localFilters.ediRequired"
          label="EDI Required"
          density="compact"
          hide-details
          class="mb-2"
          @update:model-value="updateFilter('ediRequired', $event)"
        />

        <v-checkbox
          :model-value="localFilters.dropshipEnabled"
          label="Dropship Enabled"
          density="compact"
          hide-details
          @update:model-value="updateFilter('dropshipEnabled', $event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { toRefs, computed } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  filterOptions: {
    type: Object,
    required: true
  },
  multiple: {
    type: Boolean,
    default: true
  },
  expandedPanels: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-filter', 'update:expandedPanels']);

const { filters, filterOptions } = toRefs(props);

// Local copy for v-model binding
const localFilters = computed(() => filters.value);

// Region to states mapping
const regionMapping = [
  { name: 'Northeast', states: ['NY', 'MA', 'CT', 'NJ', 'PA', 'RI', 'VT', 'NH', 'ME'] },
  { name: 'Southeast', states: ['FL', 'GA', 'NC', 'SC', 'VA', 'TN', 'AL', 'MS', 'LA'] },
  { name: 'Midwest', states: ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE'] },
  { name: 'Southwest', states: ['TX', 'AZ', 'NM', 'OK', 'AR'] },
  { name: 'West', states: ['CA', 'NV', 'CO', 'UT', 'WY', 'MT', 'ID'] },
  { name: 'Pacific NW', states: ['WA', 'OR'] }
];

// Check if region is selected
const isRegionSelected = (region) => {
  if (!localFilters.value.state || localFilters.value.state.length === 0) {
    return false;
  }
  return region.states.every(state => localFilters.value.state.includes(state));
};

// Toggle region
const toggleRegion = (region) => {
  const currentStates = localFilters.value.state || [];
  
  if (isRegionSelected(region)) {
    const newStates = currentStates.filter(state => !region.states.includes(state));
    updateFilter('state', newStates);
  } else {
    const newStates = [...new Set([...currentStates, ...region.states])];
    updateFilter('state', newStates);
  }
};

// Update filter (emit to parent)
const updateFilter = (filterKey, value) => {
  emit('update-filter', filterKey, value);
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>