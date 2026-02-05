<!-- src/views/dashboard/retailers/RetailerFilters.vue -->
<template>
  <div class="filters-drawer-content">
    <!-- Header -->
    <div class="drawer-header pa-4 d-flex align-center justify-space-between">
      <div>
        <h2 class="text-h6 font-weight-bold">
          <v-icon class="mr-2">mdi-filter-variant</v-icon>
          Filters
        </h2>
        <p class="text-caption text-medium-emphasis ma-0">
          {{ activeFilterCount }} active
        </p>
      </div>
      
      <div class="d-flex ga-2">
        <v-btn
          v-if="hasActiveFilters"
          size="small"
          variant="text"
          color="error"
          @click="handleResetAll"
        >
          Reset
        </v-btn>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="$emit('close')"
        />
      </div>
    </div>

    <v-divider />

    <!-- Filter Panels -->
    <div class="filters-content pa-4">
      <v-expansion-panels multiple variant="accordion">
        <!-- Location Filters -->
        <v-expansion-panel>
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
              v-model="localFilters.state"
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
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-store</v-icon>
            Retailer Type
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.retailerType"
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
              v-model.number="localFilters.minLocations"
              label="Min Locations"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-2"
              @update:model-value="updateFilter('minLocations', $event)"
            />

            <v-text-field
              v-model.number="localFilters.maxLocations"
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
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-currency-usd</v-icon>
            Price Point
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.pricePoint"
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
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Target Demographics
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.targetGender"
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
              v-model="localFilters.targetAgeGroup"
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
              v-model="localFilters.minRating"
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
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-hanger</v-icon>
            Product Categories
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.categories"
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
              v-model.number="localFilters.minMSRP"
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
              v-model.number="localFilters.maxMSRP"
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

        <!-- Aesthetic & Seasonality -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-palette</v-icon>
            Style & Season
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.aesthetics"
              :items="filterOptions.aesthetics"
              label="Aesthetic"
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
              v-model="localFilters.seasonality"
              :items="['Spring', 'Summer', 'Fall', 'Winter', 'Year-Round']"
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

        <!-- Financial Filters -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Financial
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-text-field
              v-model.number="localFilters.minRevenue"
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
              v-model.number="localFilters.maxRevenue"
              label="Max Annual Revenue"
              type="number"
              prefix="$"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-3"
              @update:model-value="updateFilter('maxRevenue', $event)"
            />

            <v-text-field
              v-model.number="localFilters.minOrderSize"
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
              v-model.number="localFilters.maxOrderSize"
              label="Max Opening Order"
              type="number"
              prefix="$"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="updateFilter('maxOrderSize', $event)"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- OTB Strategy & Payment -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Buying & Payment
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-select
              v-model="localFilters.otbStrategy"
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
              v-model="localFilters.paymentTerms"
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
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-cog</v-icon>
            Operations
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-checkbox
              v-model="localFilters.ediRequired"
              label="EDI Required"
              density="compact"
              hide-details
              class="mb-2"
              @update:model-value="updateFilter('ediRequired', $event)"
            />

            <v-checkbox
              v-model="localFilters.dropshipEnabled"
              label="Dropship Enabled"
              density="compact"
              hide-details
              @update:model-value="updateFilter('dropshipEnabled', $event)"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import { useRetailersStore } from '@/store/retailers';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const emit = defineEmits(['close']);

const retailersStore = useRetailersStore();
const { filters, filterOptions, hasActiveFilters, activeFilterCount } = storeToRefs(retailersStore);

// Region to states mapping
const regionMapping = [
  { name: 'Northeast', states: ['NY', 'MA', 'CT', 'NJ', 'PA', 'RI', 'VT', 'NH', 'ME'] },
  { name: 'Southeast', states: ['FL', 'GA', 'NC', 'SC', 'VA', 'TN', 'AL', 'MS', 'LA'] },
  { name: 'Midwest', states: ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE'] },
  { name: 'Southwest', states: ['TX', 'AZ', 'NM', 'OK', 'AR'] },
  { name: 'West', states: ['CA', 'NV', 'CO', 'UT', 'WY', 'MT', 'ID'] },
  { name: 'Pacific NW', states: ['WA', 'OR'] }
];

// Local copy of filters
const localFilters = ref({ ...filters.value });

// Watch store filters
watch(filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

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
    localFilters.value.state = currentStates.filter(
      state => !region.states.includes(state)
    );
  } else {
    const newStates = [...new Set([...currentStates, ...region.states])];
    localFilters.value.state = newStates;
  }
  
  updateFilter('state', localFilters.value.state);
};

// Update filter
const updateFilter = (filterKey, value) => {
  localFilters.value[filterKey] = value;
  filters.value[filterKey] = value;
};

const handleResetAll = async () => {
  await retailersStore.resetFilters();
  localFilters.value = { ...filters.value };
};
</script>

<style scoped>
.filters-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(249, 249, 249, 0.95));
}

.drawer-header {
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.filters-content {
  flex: 1;
  overflow-y: auto;
}

/* Custom scrollbar */
.filters-content::-webkit-scrollbar {
  width: 6px;
}

.filters-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

.filters-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.filters-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>