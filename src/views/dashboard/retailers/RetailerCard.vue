<!-- src/views/dashboard/retailers/RetailerCard.vue -->
<template>
  <v-card
    class="retailer-card"
    elevation="0"
    :ripple="false"
  >
    <v-card-text class="pa-5">
      <!-- Header Section -->
      <div class="card-header mb-4">
        <div class="d-flex align-center gap-3 mb-3">
          <v-avatar
            size="56"
            color="primary"
            class="text-h5 font-weight-bold avatar-shadow"
          >
            {{ retailer.businessName.charAt(0) }}
          </v-avatar>

          <div class="flex-grow-1">
            <h3 class="text-h5 font-weight-bold mb-1" style="line-height: 1.2;">
              {{ retailer.businessName }}
            </h3>
            <div class="d-flex align-center gap-2 flex-wrap">
              <span class="text-body-2 text-medium-emphasis d-flex align-center">
                <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                {{ formatLocation(retailer) }}
              </span>
              <v-chip
                v-if="retailer.retailerType"
                size="x-small"
                variant="tonal"
                color="primary"
                class="ml-1"
              >
                {{ retailer.retailerType }}
              </v-chip>
            </div>
          </div>

          <!-- Quick Actions (Desktop) -->
          <div class="d-none d-md-flex gap-1">
            <v-btn
              v-if="retailer.website"
              :href="retailer.website"
              target="_blank"
              variant="text"
              size="small"
              icon="mdi-web"
              density="comfortable"
            />
            <v-btn
              v-if="retailer.linkedinUrl"
              :href="retailer.linkedinUrl"
              target="_blank"
              variant="text"
              size="small"
              icon="mdi-linkedin"
              density="comfortable"
            />
            <v-btn
              v-if="retailer.contactEmail"
              :href="`mailto:${retailer.contactEmail}`"
              variant="text"
              size="small"
              icon="mdi-email"
              density="comfortable"
            />
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid mb-4">
        <div v-if="retailer.numLocations !== null" class="stat-box">
          <div class="stat-label">Locations</div>
          <div class="stat-value">{{ retailer.numLocations }}</div>
        </div>

        <div v-if="retailer.pricePointCategory" class="stat-box">
          <div class="stat-label">Price Point</div>
          <div class="stat-value">{{ retailer.pricePointCategory }}</div>
        </div>

        <div v-if="retailer.customerReviewRating" class="stat-box">
          <div class="stat-label">Rating</div>
          <div class="stat-value d-flex align-center gap-1">
            <v-icon size="18" color="amber">mdi-star</v-icon>
            {{ retailer.customerReviewRating.toFixed(1) }}
          </div>
        </div>

        <div v-if="retailer.estAnnualRevenue" class="stat-box">
          <div class="stat-label">Est. Revenue</div>
          <div class="stat-value">{{ formatRevenue(retailer.estAnnualRevenue) }}</div>
        </div>

        <div v-if="retailer.avgOpeningOrderSize" class="stat-box stat-box-highlight">
          <div class="stat-label">Opening Order</div>
          <div class="stat-value text-primary font-weight-bold">
            {{ formatCurrency(retailer.avgOpeningOrderSize) }}
          </div>
        </div>

        <div v-if="retailer.paymentTerms && retailer.paymentTerms.length" class="stat-box">
          <div class="stat-label">Payment Terms</div>
          <div class="stat-value text-caption">
            {{ retailer.paymentTerms.join(', ') }}
          </div>
        </div>
      </div>

      <!-- Tags Section -->
      <div class="tags-section mb-4">
        <!-- Categories -->
        <div v-if="retailer.carriedCategories && retailer.carriedCategories.length" class="mb-2">
          <div class="d-flex align-center justify-center flex-wrap gap-1">
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
          color="primary"
          variant="flat"
          size="large"
          prepend-icon="mdi-message-text"
          block
          class="action-button"
          @click="handleBeginConversation"
        >
          Begin Conversation
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
  retailer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['begin-conversation']);

const formatLocation = (retailer) => {
  const parts = [];
  if (retailer.city) parts.push(retailer.city);
  if (retailer.state) parts.push(retailer.state);
  if (retailer.usRegion && parts.length === 0) parts.push(retailer.usRegion);
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
};

const formatRevenue = (revenue) => {
  if (revenue >= 1000000000) {
    return `$${(revenue / 1000000000).toFixed(1)}B`;
  } else if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`;
  }
  return `$${revenue}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handleBeginConversation = () => {
  emit('begin-conversation', props.retailer);
};
</script>

<style scoped>
.retailer-card {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.retailer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-info));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.retailer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.retailer-card:hover::before {
  opacity: 1;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.avatar-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-box:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.stat-box-highlight {
  background: linear-gradient(135deg, rgba(91, 146, 121, 0.08), rgba(143, 203, 155, 0.08));
  border: 1px solid rgba(91, 146, 121, 0.2);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.56);
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}

/* Tags Section */
.tags-section {
  min-height: 40px;
}

/* Action Button */
.action-button {
  border-radius: 50px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(91, 146, 121, 0.25);
}

.action-button:hover {
  box-shadow: 0 6px 16px rgba(91, 146, 121, 0.35);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .retailer-card {
    border-radius: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-box {
    padding: 10px;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  .stat-value {
    font-size: 0.85rem;
  }
}
</style>