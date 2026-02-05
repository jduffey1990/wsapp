<!-- src/views/dashboard/retailers/FilterConfigurationPage.vue -->
<template>
  <div class="filter-configuration-page">
    <!-- Sticky Header -->
    <div class="sticky-header">
      <div class="header-content">
        <h1 class="text-h5 font-weight-bold mb-1">Find Your Perfect Wholesale Partners</h1>
        <p class="text-body-2 text-medium-emphasis ma-0">
          Select your target retailer criteria
        </p>
      </div>
    </div>

    <!-- Filter Content -->
    <div class="filter-content">
      <div class="filter-inner">
        <FilterCategoryContent
          :filters="localFilters"
          :filter-options="filterOptions"
          :multiple="true"
          :expanded-panels="allPanels"
          @update-filter="handleFilterUpdate"
          @update:expanded-panels="handlePanelsUpdate"
        />
      </div>
    </div>

    <!-- Sticky Footer -->
    <div class="sticky-footer">
      <div class="footer-content">
        <v-btn
          v-if="!hasAnyFilters"
          color="primary"
          size="large"
          :loading="loading"
          @click="handleShowResults"
        >
          Show All Retailers
        </v-btn>
        
        <v-btn
          v-else
          color="primary"
          size="large"
          :loading="fetchingCount || loading"
          @click="handleShowResults"
        >
          <template v-if="fetchingCount">
            Counting...
          </template>
          <template v-else>
            Show {{ matchingRetailerCount }} Target Retailer{{ matchingRetailerCount !== 1 ? 's' : '' }}
          </template>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRetailersStore } from '@/store/retailers';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import FilterCategoryContent from './FilterCategoryContent.vue';

const retailersStore = useRetailersStore();
const { filters, filterOptions, matchingRetailerCount, fetchingCount } = storeToRefs(retailersStore);

// Local state
const loading = ref(false);
const localFilters = ref({ ...filters.value });

// All panels expanded by default
const allPanels = ref([
  'location',
  'retailerType',
  'pricePoint',
  'demographics',
  'productCategories',
  'aesthetic',
  'financial',
  'buyingTerms',
  'operations'
]);

// Check if any filters are set
const hasAnyFilters = computed(() => {
  return Object.values(localFilters.value).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  });
});

// Watch filters and fetch count when they change
let countTimeout = null;
watch(localFilters, () => {
  if (hasAnyFilters.value) {
    // Debounce the count fetch
    clearTimeout(countTimeout);
    countTimeout = setTimeout(() => {
      retailersStore.fetchRetailerCount();
    }, 500);
  } else {
    retailersStore.matchingRetailerCount = 0;
  }
}, { deep: true });

// Handle filter updates from child component
const handleFilterUpdate = (filterKey, value) => {
  localFilters.value[filterKey] = value;
  filters.value[filterKey] = value; // Update store
};

// Handle panel expansion/collapse
const handlePanelsUpdate = (newPanels) => {
  allPanels.value = newPanels;
};

// Handle show results button click
const handleShowResults = async () => {
  loading.value = true;
  
  try {
    // Mark filters as configured
    retailersStore.setFiltersConfigured(true);
    
    // Fetch retailers with current filters
    await retailersStore.fetchRetailers(true);
  } catch (error) {
    console.error('Error fetching retailers:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.filter-configuration-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  text-align: center;
}

/* Filter Content */
.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 120px 16px; /* Extra bottom padding for sticky footer */
}

.filter-inner {
  max-width: 800px;
  margin: 0 auto;
}

/* Style the expansion panels to match BrandPanel cards */
.filter-inner :deep(.v-expansion-panels) {
  gap: 12px;
}

.filter-inner :deep(.v-expansion-panel) {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 12px;
}

.filter-inner :deep(.v-expansion-panel-title) {
  font-weight: 700;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background: rgba(91, 146, 121, 0.05);
}

.filter-inner :deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

/* Sticky Footer */
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.footer-content .v-btn {
  width: 100%;
  max-width: 400px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Mobile optimizations */
@media (max-width: 780px) {
  .header-content {
    padding: 20px 16px;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .filter-content {
    padding: 16px 12px 120px 12px;
  }

  .footer-content {
    padding: 16px 12px;
  }
}

/* Custom scrollbar */
.filter-content::-webkit-scrollbar {
  width: 8px;
}

.filter-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
}

.filter-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>