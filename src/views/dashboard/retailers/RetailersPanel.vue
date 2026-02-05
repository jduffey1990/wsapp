<!-- src/views/dashboard/retailers/RetailersPanel.vue -->
<template>
  <v-container fluid class="retailers-panel pa-0">
    <!-- Filter Configuration Page (First Visit) -->
    <FilterConfigurationPage v-if="!filtersConfigured" />

    <!-- Main Retailers View (After Configuration) -->
    <template v-else>
      <!-- Header Bar -->
      <div class="header-bar pa-4">
        <v-row align="center" dense>
          <v-col cols="12" md="auto" class="mb-2 mb-md-0 text-center text-md-start">
            <div>
              <h1 class="text-h5 font-weight-bold mb-1">Retailer Discovery</h1>
              <p class="text-body-2 text-medium-emphasis ma-0">
                Find your perfect wholesale partners
              </p>
            </div>
          </v-col>

          <v-spacer class="d-none d-md-flex" />

          <v-col cols="12" md="auto">
            <div class="d-flex ga-2 justify-center justify-md-start">
              <!-- Edit Filters Button -->
              <v-btn
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="handleEditFilters"
              >
                Edit Filters
              </v-btn>

              <!-- Filter Toggle Button -->
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-filter-variant"
                @click="filterDrawerOpen = !filterDrawerOpen"
              >
                Filters
                <v-badge
                  v-if="activeFilterCount > 0"
                  :content="activeFilterCount"
                  color="error"
                  inline
                  class="ml-2"
                />
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Main Content Area -->
      <div class="content-wrapper">
        <!-- Filter Drawer -->
        <v-navigation-drawer
          v-model="filterDrawerOpen"
          temporary
          location="left"
          width="320"
          class="filter-drawer"
        >
          <RetailerFilters @close="filterDrawerOpen = false" />
        </v-navigation-drawer>

        <!-- Main Content -->
        <div class="main-content pa-4">
          <!-- Search Bar & Controls -->
          <v-card class="mb-4 search-card" elevation="0">
            <v-card-text>
              <v-row dense align="center">
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model="searchInput"
                    placeholder="Search retailers by name, city, or type..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    @update:model-value="debouncedSearch"
                    @click:clear="handleClearSearch"
                  />
                </v-col>
                
                <v-col cols="12" md="5">
                  <div class="d-flex ga-2">
                    <v-select
                      v-model="sortBy"
                      :items="sortOptions"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      label="Sort by"
                      @update:model-value="handleSortChange"
                    />
                    
                    <v-btn
                      :icon="sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                      variant="outlined"
                      @click="toggleSortOrder"
                    />
                  </div>
                </v-col>
              </v-row>

              <!-- Active Filters Chips -->
              <v-row v-if="hasActiveFilters" dense class="mt-2">
                <v-col cols="12">
                  <div class="d-flex flex-wrap ga-2 align-center">
                    <span class="text-caption text-medium-emphasis">Active:</span>
                    
                    <!-- State chips -->
                    <v-chip
                      v-for="state in filters.state"
                      :key="`state-${state}`"
                      size="small"
                      closable
                      @click:close="removeFilter('state', state)"
                    >
                      {{ state }}
                    </v-chip>

                    <!-- Retailer Type chips -->
                    <v-chip
                      v-for="type in filters.retailerType"
                      :key="`type-${type}`"
                      size="small"
                      closable
                      @click:close="removeFilter('retailerType', type)"
                    >
                      {{ type }}
                    </v-chip>

                    <!-- Price Point chips -->
                    <v-chip
                      v-for="price in filters.pricePoint"
                      :key="`price-${price}`"
                      size="small"
                      closable
                      @click:close="removeFilter('pricePoint', price)"
                    >
                      {{ price }}
                    </v-chip>

                    <!-- Categories chips -->
                    <v-chip
                      v-for="cat in filters.categories"
                      :key="`cat-${cat}`"
                      size="small"
                      closable
                      @click:close="removeFilter('categories', cat)"
                    >
                      {{ cat }}
                    </v-chip>

                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="clearAllFilters"
                    >
                      Clear All
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Loading State -->
          <div v-if="loading" class="mt-8">
            <v-skeleton-loader type="card@3" />
          </div>

          <!-- Empty State -->
          <v-card v-else-if="retailers.length === 0" class="pa-12 empty-state-card" elevation="0">
            <v-icon size="80" color="grey-lighten-1">mdi-store-search-outline</v-icon>
            <h3 class="text-h6 mt-4 mb-2">No retailers found</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Try adjusting your filters or search query
            </p>
            <v-btn
              v-if="hasActiveFilters"
              color="primary"
              variant="outlined"
              @click="clearAllFilters"
            >
              Clear all filters
            </v-btn>
          </v-card>

          <!-- Retailers Grid -->
          <div v-else class="retailers-grid">
            <RetailerCard
              v-for="retailer in retailers"
              :key="retailer.id"
              :retailer="retailer"
              class="mb-3"
              @begin-conversation="handleBeginConversation"
            />
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="d-flex justify-center mt-6">
            <v-pagination
              v-model="pagination.page"
              :length="pagination.totalPages"
              :total-visible="7"
              @update:model-value="handlePageChange"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Begin Conversation Modal -->
    <BeginConversationModal
      v-model="conversationModal.open"
      :retailer="conversationModal.retailer"
      @conversation-started="handleConversationStarted"
    />
  </v-container>
</template>

<script setup>
import { useRetailersStore } from '@/store/retailers';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BeginConversationModal from './BeginConversationModal.vue';
import FilterConfigurationPage from './FilterConfigurationPage.vue';
import RetailerCard from './RetailerCard.vue';
import RetailerFilters from './RetailerFilters.vue';

const router = useRouter();
const retailersStore = useRetailersStore();
const { user } = storeToRefs(useUserStore());
const toast = inject('toast');

const {
  retailers,
  filters,
  pagination,
  loading,
  searchQuery,
  hasActiveFilters,
  activeFilterCount,
  filtersConfigured
} = storeToRefs(retailersStore);

// Local state
const filterDrawerOpen = ref(false);
const searchInput = ref('');
const sortBy = ref('businessName');
const sortOrder = ref('asc');
const conversationModal = ref({
  open: false,
  retailer: null
});

const sortOptions = [
  { title: 'Name', value: 'businessName' },
  { title: 'Revenue', value: 'estAnnualRevenue' },
  { title: 'Locations', value: 'numLocations' },
  { title: 'Rating', value: 'customerReviewRating' },
  { title: 'Order Size', value: 'avgOpeningOrderSize' }
];

// Watch filters and auto-fetch with debounce
let filterTimeout = null;
watch(filters, () => {
  if (filtersConfigured.value) {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(async () => {
      try {
        await retailersStore.fetchRetailers(true);
      } catch (error) {
        toast?.show({ message: 'Failed to apply filters', error: true });
      }
    }, 500);
  }
}, { deep: true });

// Debounced search
let searchTimeout = null;
const debouncedSearch = (value) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    retailersStore.updateSearch(value || '').catch(error => {
      toast?.show({ message: 'Failed to search retailers', error: true });
    });
  }, 500);
};

const handleClearSearch = () => {
  searchInput.value = '';
  retailersStore.updateSearch('').catch(error => {
    toast?.show({ message: 'Failed to clear search', error: true });
  });
};

const handleSortChange = async (value) => {
  try {
    await retailersStore.updateSort(value, sortOrder.value);
  } catch (error) {
    toast?.show({ message: 'Failed to update sort', error: true });
  }
};

const toggleSortOrder = async () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  try {
    await retailersStore.updateSort(sortBy.value, sortOrder.value);
  } catch (error) {
    toast?.show({ message: 'Failed to update sort', error: true });
  }
};

const handlePageChange = async (page) => {
  try {
    await retailersStore.goToPage(page);
  } catch (error) {
    toast?.show({ message: 'Failed to change page', error: true });
  }
};

const removeFilter = async (filterKey, value) => {
  const currentValue = filters.value[filterKey];
  if (Array.isArray(currentValue)) {
    const newValue = currentValue.filter(v => v !== value);
    filters.value[filterKey] = newValue;
  }
};

const clearAllFilters = async () => {
  try {
    await retailersStore.resetFilters();
  } catch (error) {
    toast?.show({ message: 'Failed to clear filters', error: true });
  }
};

const handleEditFilters = () => {
  // Return to filter configuration page
  retailersStore.resetFilterConfiguration();
};

const handleBeginConversation = (retailer) => {
  conversationModal.value = {
    open: true,
    retailer
  };
};

const handleConversationStarted = (conversationId) => {
  conversationModal.value.open = false;
  router.push({
    name: 'Conversations',
    params: { id: conversationId }
  });
};

// Mount
onMounted(async () => {
  try {
    // Load filter options
    await retailersStore.fetchFilterOptions();
    
    // Only fetch retailers if filters are already configured
    if (filtersConfigured.value) {
      await retailersStore.fetchRetailers();
    }
  } catch (error) {
    console.error('Error initializing retailers:', error);
    toast?.show({ message: 'Failed to initialize', error: true });
  }
});
</script>

<style scoped>
.retailers-panel {
  min-height: 100vh;
}

.header-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 9;
}

.content-wrapper {
  position: relative;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.search-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.retailers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.empty-state-card {
  text-align: center;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.ga-2 {
  gap: 0.5rem;
}

/* Chip styling */
:deep(.v-chip) {
  font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 780px) {
  .retailers-grid {
    grid-template-columns: 1fr;
  }

  .header-bar .v-row {
    gap: 8px;
  }
}
</style>