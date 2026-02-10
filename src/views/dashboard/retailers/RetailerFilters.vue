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

    <!-- Filter Panels (Only Active Categories) -->
    <div class="filters-content pa-4">
      <FilterCategoryContent
        :filters="localFilters"
        :filter-options="filterOptions"
        :multiple="true"
        :expanded-panels="expandedPanels"
        :visible-categories="activeFilterCategories"
        @update-filter="handleFilterUpdate"
        @update:expanded-panels="handlePanelsUpdate"
      />

      <!-- Empty State -->
      <div v-if="activeFilterCategories.length === 0" class="text-center pa-6">
        <v-icon size="48" color="grey-lighten-1">mdi-filter-off</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-3">
          No active filters
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRetailersStore } from '@/store/retailers';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import FilterCategoryContent from './FilterCategoryContent.vue';

const emit = defineEmits(['close']);

const retailersStore = useRetailersStore();
const { filters, filterOptions, hasActiveFilters, activeFilterCount, activeFilterCategories } = storeToRefs(retailersStore);

// Local copy of filters
const localFilters = ref({ ...filters.value });

// Track which panels are expanded (separate from which are visible)
const expandedPanels = ref([...activeFilterCategories.value]);

// Only show panels that have active filters
const visiblePanels = computed(() => {
  return activeFilterCategories.value;
});

// Watch active categories and update expanded panels
watch(activeFilterCategories, (newCategories) => {
  // When categories change, expand all visible ones by default
  expandedPanels.value = [...newCategories];
}, { deep: true });

// Watch store filters
watch(filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Handle filter updates
const handleFilterUpdate = (filterKey, value) => {
  localFilters.value[filterKey] = value;
  filters.value[filterKey] = value;
  
  // Update active categories
  retailersStore.updateActiveFilterCategories();
};

// Handle panel expansion/collapse
const handlePanelsUpdate = (newPanels) => {
  expandedPanels.value = newPanels;
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.filters-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Style expansion panels to match BrandPanel */
.filters-content :deep(.v-expansion-panel) {
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.3));
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0,0,0,0.05);
  margin-bottom: 8px;
  overflow: hidden;
}

.filters-content :deep(.v-expansion-panel-title) {
  font-weight: 600;
  font-size: 0.9rem;
}

.filters-content :deep(.v-expansion-panel-text__wrapper) {
  padding: 12px 16px;
}

.ga-2 {
  gap: 0.5rem;
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