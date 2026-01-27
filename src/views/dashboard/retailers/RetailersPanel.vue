<!-- src/views/dashboard/retailers/RetailersPanel.vue -->
<template>
  <v-container fluid class="retailers-panel pa-0">
    <!-- Header Bar -->
    <div class="header-bar pa-4">
      <v-row align="center" dense>
        <v-col cols="12" md="auto" class="mb-2 mb-md-0">
          <div>
            <h1 class="text-h5 font-weight-bold mb-1">Retailer Discovery</h1>
            <p class="text-body-2 text-medium-emphasis ma-0">
              Find your perfect wholesale partners
            </p>
          </div>
        </v-col>

        <v-spacer class="d-none d-md-flex" />

        <v-col cols="12" md="auto">
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
        <v-card class="mb-4" elevation="0" color="grey-lighten-4">
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

                  <!-- Aesthetics chips -->
                  <v-chip
                    v-for="aesthetic in filters.aesthetics"
                    :key="`aesthetic-${aesthetic}`"
                    size="small"
                    closable
                    @click:close="removeFilter('aesthetics', aesthetic)"
                  >
                    {{ aesthetic }}
                  </v-chip>

                  <!-- Clear All -->
                  <v-btn
                    size="small"
                    variant="text"
                    color="error"
                    @click="clearAllFilters"
                  >
                    Clear all
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Results Summary & Pagination Controls -->
        <div class="d-flex align-center justify-space-between mb-4">
          <p class="text-body-2 text-medium-emphasis ma-0">
            <template v-if="!loading">
              Showing {{ retailers.length }} of {{ pagination.total }} retailers
            </template>
          </p>

          <v-select
            v-model="pagination.limit"
            :items="[10, 20, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 120px;"
            @update:model-value="handleLimitChange"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading retailers...</p>
        </div>

        <!-- Empty State -->
        <v-card v-else-if="retailers.length === 0" class="text-center pa-12" elevation="0">
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

    <!-- Begin Conversation Modal -->
    <BeginConversationModal
      v-model="conversationModal.open"
      :retailer="conversationModal.retailer"
      @conversation-started="handleConversationStarted"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRetailersStore } from '@/store/retailers';
import { useUserStore } from '@/store/user';
import RetailerFilters from './RetailerFilters.vue';
import RetailerCard from './RetailerCard.vue';
import BeginConversationModal from './BeginConversationModal.vue';

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
  activeFilterCount
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
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(async () => {
    try {
      await retailersStore.fetchRetailers(true);
    } catch (error) {
      toast?.show({ message: 'Failed to apply filters', error: true });
    }
  }, 500);
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
    toast?.show({ message: 'Failed to toggle sort order', error: true });
  }
};

const handlePageChange = async (page) => {
  try {
    await retailersStore.goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    toast?.show({ message: 'Failed to load page', error: true });
  }
};

const handleLimitChange = async (limit) => {
  try {
    await retailersStore.changeLimit(limit);
  } catch (error) {
    toast?.show({ message: 'Failed to update items per page', error: true });
  }
};

const removeFilter = (filterName, value) => {
  const currentFilter = filters.value[filterName];
  if (Array.isArray(currentFilter)) {
    filters.value[filterName] = currentFilter.filter(v => v !== value);
  } else {
    filters.value[filterName] = null;
  }
};

const clearAllFilters = async () => {
  searchInput.value = '';
  try {
    await retailersStore.resetFilters();
  } catch (error) {
    toast?.show({ message: 'Failed to reset filters', error: true });
  }
};

const handleBeginConversation = (retailer) => {
  conversationModal.value = {
    open: true,
    retailer
  };
};

const handleConversationStarted = (conversationId) => {
  conversationModal.value.open = false;
  // Navigate to specific conversation using nested route
  router.push(`/dashboard/conversations/${conversationId}`);
};

// Initialize
onMounted(async () => {
  try {
    await retailersStore.fetchFilterOptions();
  } catch (error) {
    toast?.show({ message: 'Failed to load filter options', error: true });
  }
  
  try {
    await retailersStore.fetchRetailers();
  } catch (error) {
    toast?.show({ message: 'Failed to load retailers', error: true });
  }
});

// Sync search input with store
watch(searchQuery, (newVal) => {
  if (searchInput.value !== newVal) {
    searchInput.value = newVal;
  }
});
</script>

<style scoped>
.retailers-panel {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header-bar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-wrapper {
  position: relative;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.retailers-grid {
  display: grid;
  gap: 16px;
}

/* Single column on mobile */
@media (max-width: 959px) {
  .retailers-grid {
    grid-template-columns: 1fr;
  }
}

/* Two columns on medium screens */
@media (min-width: 960px) and (max-width: 1439px) {
  .retailers-grid {
    grid-template-columns: 1fr;
  }
}

/* Still one column on large screens to keep cards readable */
@media (min-width: 1440px) {
  .retailers-grid {
    grid-template-columns: 1fr;
  }
}

.filter-drawer {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}
</style>