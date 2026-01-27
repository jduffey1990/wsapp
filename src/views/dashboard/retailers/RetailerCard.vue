<!-- src/views/dashboard/retailers/RetailerCard.vue -->
<template>
  <v-card
    class="retailer-card"
    elevation="2"
    :ripple="false"
  >
    <v-card-text>
      <v-row align="center">
        <!-- Left: Retailer Info -->
        <v-col cols="12" md="8">
          <div class="d-flex align-start gap-3">
            <!-- Logo/Icon -->
            <v-avatar
              size="60"
              color="primary"
              class="text-h5 font-weight-bold"
            >
              {{ retailer.businessName.charAt(0) }}
            </v-avatar>

            <!-- Info -->
            <div class="flex-grow-1">
              <!-- Name & Type -->
              <div class="d-flex align-center gap-2 mb-1">
                <h3 class="text-h6 font-weight-bold">{{ retailer.businessName }}</h3>
                <v-chip
                  v-if="retailer.retailerType"
                  size="small"
                  variant="tonal"
                  color="primary"
                >
                  {{ retailer.retailerType }}
                </v-chip>
              </div>

              <!-- Location -->
              <p class="text-body-2 text-medium-emphasis mb-2">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                {{ formatLocation(retailer) }}
              </p>

              <!-- Key Stats -->
              <div class="d-flex flex-wrap gap-3 mb-2">
                <div v-if="retailer.numLocations !== null" class="stat-item">
                  <v-icon size="small" class="mr-1">mdi-store</v-icon>
                  <span class="text-caption">
                    {{ retailer.numLocations }} location{{ retailer.numLocations !== 1 ? 's' : '' }}
                  </span>
                </div>

                <div v-if="retailer.pricePointCategory" class="stat-item">
                  <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                  <span class="text-caption">{{ retailer.pricePointCategory }}</span>
                </div>

                <div v-if="retailer.customerReviewRating" class="stat-item">
                  <v-icon size="small" class="mr-1" color="amber">mdi-star</v-icon>
                  <span class="text-caption">{{ retailer.customerReviewRating.toFixed(1) }}</span>
                </div>

                <div v-if="retailer.estAnnualRevenue" class="stat-item">
                  <v-icon size="small" class="mr-1">mdi-currency-usd</v-icon>
                  <span class="text-caption">{{ formatRevenue(retailer.estAnnualRevenue) }}</span>
                </div>
              </div>

              <!-- Categories -->
              <div v-if="retailer.carriedCategories && retailer.carriedCategories.length" class="mb-2">
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="category in retailer.carriedCategories.slice(0, 5)"
                    :key="category"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ category }}
                  </v-chip>
                  <v-chip
                    v-if="retailer.carriedCategories.length > 5"
                    size="x-small"
                    variant="text"
                  >
                    +{{ retailer.carriedCategories.length - 5 }} more
                  </v-chip>
                </div>
              </div>

              <!-- Aesthetic & Additional Info -->
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-if="retailer.primaryAesthetic"
                  size="small"
                  variant="flat"
                  color="secondary"
                >
                  {{ retailer.primaryAesthetic }}
                </v-chip>

                <v-chip
                  v-if="retailer.dropshipEnabled"
                  size="small"
                  variant="flat"
                  color="success"
                >
                  <v-icon start size="small">mdi-truck-fast</v-icon>
                  Dropship
                </v-chip>

                <v-chip
                  v-if="retailer.ediRequired"
                  size="small"
                  variant="flat"
                  color="info"
                >
                  <v-icon start size="small">mdi-file-document</v-icon>
                  EDI
                </v-chip>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right: Actions -->
        <v-col cols="12" md="4">
          <div class="d-flex flex-column gap-2 align-end">
            <!-- Order Size & Payment Terms -->
            <div v-if="retailer.avgOpeningOrderSize" class="text-right mb-2">
              <div class="text-caption text-medium-emphasis">Avg Opening Order</div>
              <div class="text-h6 font-weight-bold text-success">
                {{ formatCurrency(retailer.avgOpeningOrderSize) }}
              </div>
            </div>

            <div v-if="retailer.paymentTerms && retailer.paymentTerms.length" class="mb-2">
              <div class="text-caption text-medium-emphasis mb-1">Payment Terms</div>
              <div class="d-flex flex-wrap gap-1 justify-end">
                <v-chip
                  v-for="term in retailer.paymentTerms"
                  :key="term"
                  size="x-small"
                  variant="tonal"
                >
                  {{ term }}
                </v-chip>
              </div>
            </div>

            <!-- Primary Action Button -->
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              prepend-icon="mdi-message-text"
              block
              @click="handleBeginConversation"
            >
              Begin Conversation
            </v-btn>

            <!-- Secondary Actions -->
            <div class="d-flex gap-2 w-100">
              <v-btn
                v-if="retailer.website"
                :href="retailer.website"
                target="_blank"
                variant="outlined"
                size="small"
                icon="mdi-web"
              />

              <v-btn
                v-if="retailer.linkedinUrl"
                :href="retailer.linkedinUrl"
                target="_blank"
                variant="outlined"
                size="small"
                icon="mdi-linkedin"
              />

              <v-btn
                v-if="retailer.contactEmail"
                :href="`mailto:${retailer.contactEmail}`"
                variant="outlined"
                size="small"
                icon="mdi-email"
              />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

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
  transition: all 0.2s ease;
}

.retailer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-item {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
}
</style>