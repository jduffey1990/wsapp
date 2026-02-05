<!-- src/views/dashboard/retailers/RetailerCard.vue -->
<template>
  <v-card class="retailer-card" elevation="2" hover>
    <v-card-text class="pa-0">
      <!-- Header Section -->
      <div class="header-section pa-4 pb-3">
        <div class="d-flex align-center mb-3">
          <v-avatar size="56" color="primary" class="mr-3">
            <span class="text-h6">{{ retailer.businessName?.charAt(0) || '?' }}</span>
          </v-avatar>
          
          <div class="flex-1">
            <h3 class="text-h6 mb-1">{{ retailer.businessName }}</h3>
            <div class="text-caption text-medium-emphasis">
              <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
              {{ formatLocation(retailer) }}
            </div>
          </div>
        </div>

        <!-- Type & Price Chips -->
        <div class="d-flex gap-2 mb-2">
          <v-chip
            v-if="retailer.retailerType"
            size="small"
            color="success"
            variant="tonal"
          >
            {{ retailer.retailerType }}
          </v-chip>
          <v-chip
            v-if="retailer.pricePointCategory"
            size="small"
            color="secondary"
            variant="tonal"
          >
            {{ retailer.pricePointCategory }}
          </v-chip>
        </div>
      </div>

      <v-divider />

      <!-- Stats Grid -->
      <div class="stats-grid pa-4">
        <div class="stat-item">
          <div class="stat-label">Locations</div>
          <div class="stat-value">{{ retailer.numLocations || 'N/A' }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Revenue</div>
          <div class="stat-value">
            {{ retailer.estAnnualRevenue ? `$${(retailer.estAnnualRevenue / 1000000).toFixed(1)}M` : 'N/A' }}
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Rating</div>
          <div class="stat-value">
            {{ retailer.customerReviewRating ? `${retailer.customerReviewRating}★` : 'N/A' }}
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Order Size</div>
          <div class="stat-value">
            {{ retailer.avgOpeningOrderSize ? `$${(retailer.avgOpeningOrderSize / 1000).toFixed(0)}k` : 'N/A' }}
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Details Section -->
      <div class="details-section pa-4">
        <!-- Categories -->
        <div v-if="retailer.carriedCategories?.length > 0" class="mb-3">
          <div class="text-caption text-medium-emphasis mb-2">Categories</div>
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="category in retailer.carriedCategories.slice(0, 4)"
              :key="category"
              size="x-small"
              variant="outlined"
              density="comfortable"
            >
              {{ category }}
            </v-chip>
            <v-chip
              v-if="retailer.carriedCategories.length > 4"
              size="x-small"
              variant="text"
              class="text-medium-emphasis"
            >
              +{{ retailer.carriedCategories.length - 4 }}
            </v-chip>
          </div>
        </div>

        <!-- Features -->
        <div class="d-flex align-center justify-center flex-wrap gap-2">
          <v-chip
            v-if="retailer.primaryAesthetic"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="mdi-palette"
          >
            {{ retailer.primaryAesthetic }}
          </v-chip>

          <v-chip
            v-if="retailer.dropshipEnabled"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="mdi-truck-fast"
          >
            Dropship
          </v-chip>

          <v-chip
            v-if="retailer.ediRequired"
            size="small"
            variant="tonal"
            color="success"
            prepend-icon="mdi-file-document"
          >
            EDI
          </v-chip>
        </div>
      </div>

      <!-- Action Section -->
      <div class="action-section">
        <v-btn
          v-if="!isInWorkshop"
          color="primary"
          variant="flat"
          size="large"
          prepend-icon="mdi-plus"
          block
          class="action-button"
          @click="handleAddToWorkshop"
        >
          Add to Workshop
        </v-btn>
        
        <v-btn
          v-else
          color="error"
          variant="outlined"
          size="large"
          prepend-icon="mdi-close"
          block
          class="action-button"
          @click="handleRemoveFromWorkshop"
        >
          Remove from Workshop
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { useWorkshopStore } from '@/store/workshop';
import { storeToRefs } from 'pinia';
import { computed, inject } from 'vue';

const props = defineProps({
  retailer: {
    type: Object,
    required: true
  }
});

const workshopStore = useWorkshopStore();
const { user } = storeToRefs(useUserStore());
const toast = inject('toast');

// Check if retailer is in workshop
const isInWorkshop = computed(() => {
  return workshopStore.isInWorkshop(props.retailer.id);
});

const formatLocation = (retailer) => {
  const parts = [];
  if (retailer.city) parts.push(retailer.city);
  if (retailer.state) parts.push(retailer.state);
  if (retailer.usRegion && parts.length === 0) parts.push(retailer.usRegion);
  return parts.length > 0 ? parts.join(', ') : 'Location Unknown';
};

const handleAddToWorkshop = () => {
  try {
    workshopStore.addToWorkshop(props.retailer, user.value);
    toast?.show({
      message: `${props.retailer.businessName} added to workshop`,
      error: false
    });
  } catch (error) {
    console.error('Error adding to workshop:', error);
    toast?.show({
      message: 'Failed to add to workshop',
      error: true
    });
  }
};

const handleRemoveFromWorkshop = () => {
  try {
    workshopStore.removeFromWorkshop(props.retailer.id);
    toast?.show({
      message: `${props.retailer.businessName} removed from workshop`,
      error: false
    });
  } catch (error) {
    console.error('Error removing from workshop:', error);
    toast?.show({
      message: 'Failed to remove from workshop',
      error: true
    });
  }
};
</script>

<style scoped>
.retailer-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.retailer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 12px 32px rgba(0,0,0,0.1) !important;
}

.header-section {
  background: linear-gradient(135deg, rgba(91, 146, 121, 0.08), rgba(91, 146, 121, 0.04));
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(0,0,0,0.56);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.details-section {
  flex: 1;
}

.action-section {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0,0,0,0.04);
}

.action-button {
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

/* Chips styling */
:deep(.v-chip) {
  font-weight: 500;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>