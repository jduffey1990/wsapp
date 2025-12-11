<!-- src/views/dashboard/recommendations/RecommendationsPanel.vue -->
<template>
  <v-container fluid>
    <!-- Header / Filters -->
    <div class="table-title">
      <div>
        <div class="text-h6">Retailer Recommendations</div>
        <div class="text-caption text-medium-emphasis">
          AI-powered matches based on your products and brand
        </div>
      </div>
      <div class="d-flex ga-2 title-bottom">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="compact"
          style="max-width: 200px"
          @update:model-value="fetchRecommendations"
        />
        <v-select
          v-model="minConfidence"
          :items="confidenceOptions"
          label="Min Confidence"
          variant="outlined"
          density="compact"
          style="max-width: 200px"
          @update:model-value="fetchRecommendations"
        />
      </div>
    </div>

    <!-- Loading State -->
    <v-skeleton-loader
      v-if="loading"
      class="mt-6"
      type="card@3"
    />

    <!-- Empty State -->
    <div v-else-if="recommendations.length === 0" class="mt-8 text-center">
      <v-icon size="64" color="grey-lighten-1">mdi-store-search-outline</v-icon>
      <div class="text-h6 mt-4 mb-2">No Recommendations Yet</div>
      <div class="text-body-2 mb-4">
        Start a conversation with our AI to discover retailer matches
      </div>
    </div>

    <!-- Recommendations List -->
    <v-row v-else dense class="mt-4">
      <v-col
        v-for="rec in recommendations"
        :key="rec.id"
        cols="12"
      >
        <v-card class="recommendation-card" elevation="2">
          <v-card-text>
            <v-row align="center">
              <!-- Left: Retailer Info -->
              <v-col cols="12" md="5">
                <div class="d-flex align-center gap-3">
                  <v-avatar color="primary" size="56">
                    <v-icon size="28">mdi-store</v-icon>
                  </v-avatar>
                  <div class="flex-1">
                    <div class="text-h6">{{ rec.retailerName }}</div>
                    <div v-if="rec.retailerData?.category" class="text-caption text-medium-emphasis">
                      {{ rec.retailerData.category }}
                    </div>
                    <div v-if="rec.retailerData?.location" class="text-caption text-medium-emphasis">
                      {{ formatLocation(rec.retailerData.location) }}
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Center: Confidence & Status -->
              <v-col cols="12" md="3" class="text-center">
                <div class="confidence-score">
                  <v-progress-circular
                    :model-value="(rec.confidenceScore || 0) * 100"
                    :color="getConfidenceColor(rec.confidenceScore)"
                    :size="60"
                    :width="6"
                  >
                    <span class="text-h6">{{ Math.round((rec.confidenceScore || 0) * 100) }}%</span>
                  </v-progress-circular>
                  <div class="text-caption mt-1">Confidence</div>
                </div>

                <v-chip
                  :color="getStatusColor(rec.status)"
                  size="small"
                  label
                  class="mt-3"
                >
                  {{ rec.status }}
                </v-chip>
              </v-col>

              <!-- Right: Actions -->
              <v-col cols="12" md="4" class="text-right">
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    v-if="rec.status === 'new'"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-eye"
                    @click="markAsViewed(rec)"
                  >
                    Mark as Viewed
                  </v-btn>

                  <v-btn
                    v-if="rec.status === 'new' || rec.status === 'viewed'"
                    color="success"
                    variant="outlined"
                    prepend-icon="mdi-email"
                    @click="markAsContacted(rec)"
                  >
                    Mark as Contacted
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-information"
                    @click="openDetails(rec)"
                  >
                    View Details
                  </v-btn>
                </div>
              </v-col>
            </v-row>

            <!-- Reasoning (Collapsible) -->
            <v-expand-transition>
              <div v-if="rec.showReasoning" class="mt-4 pt-4" style="border-top: 1px solid rgba(0,0,0,0.1)">
                <div class="text-subtitle-2 mb-2">
                  <v-icon size="18" class="mr-1">mdi-lightbulb-on-outline</v-icon>
                  Why this match?
                </div>
                <div class="text-body-2">{{ rec.reasoning }}</div>

                <!-- Match Attributes -->
                <div v-if="rec.matchAttributes" class="mt-3">
                  <div class="text-caption text-medium-emphasis mb-2">Match Breakdown</div>
                  <div class="match-attributes">
                    <div
                      v-for="(value, key) in rec.matchAttributes"
                      :key="key"
                      class="attribute-item"
                    >
                      <span class="attribute-label">{{ formatAttributeName(key) }}</span>
                      <v-progress-linear
                        :model-value="value * 100"
                        :color="getConfidenceColor(value)"
                        height="6"
                        rounded
                      />
                      <span class="attribute-value">{{ Math.round(value * 100) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-expand-transition>

            <v-btn
              variant="text"
              size="small"
              class="mt-2"
              @click="rec.showReasoning = !rec.showReasoning"
            >
              {{ rec.showReasoning ? 'Hide' : 'Show' }} Details
              <v-icon :icon="rec.showReasoning ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog.open" max-width="700">
      <v-card v-if="detailsDialog.recommendation">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ detailsDialog.recommendation.retailerName }}</span>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog.open = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <!-- Contact Info -->
          <div v-if="detailsDialog.recommendation.retailerData?.contact" class="mb-4">
            <div class="text-subtitle-1 mb-2">Contact Information</div>
            <div v-if="detailsDialog.recommendation.retailerData.contact.email" class="mb-1">
              <v-icon size="18" class="mr-2">mdi-email</v-icon>
              <a :href="`mailto:${detailsDialog.recommendation.retailerData.contact.email}`">
                {{ detailsDialog.recommendation.retailerData.contact.email }}
              </a>
            </div>
            <div v-if="detailsDialog.recommendation.retailerData.contact.phone" class="mb-1">
              <v-icon size="18" class="mr-2">mdi-phone</v-icon>
              {{ detailsDialog.recommendation.retailerData.contact.phone }}
            </div>
            <div v-if="detailsDialog.recommendation.retailerData.contact.buyerName" class="mb-1">
              <v-icon size="18" class="mr-2">mdi-account</v-icon>
              {{ detailsDialog.recommendation.retailerData.contact.buyerName }}
            </div>
          </div>

          <!-- Website -->
          <div v-if="detailsDialog.recommendation.retailerData?.website" class="mb-4">
            <div class="text-subtitle-1 mb-2">Website</div>
            <a
              :href="detailsDialog.recommendation.retailerData.website"
              target="_blank"
              rel="noopener"
            >
              {{ detailsDialog.recommendation.retailerData.website }}
              <v-icon size="16">mdi-open-in-new</v-icon>
            </a>
          </div>

          <!-- Reasoning -->
          <div class="mb-4">
            <div class="text-subtitle-1 mb-2">Why This Match?</div>
            <div class="text-body-2">
              {{ detailsDialog.recommendation.reasoning || 'No reasoning provided' }}
            </div>
          </div>

          <!-- User Feedback -->
          <v-divider class="my-4" />
          <div class="text-subtitle-1 mb-3">Your Feedback</div>

          <v-rating
            v-model="detailsDialog.rating"
            hover
            color="warning"
            active-color="warning"
          />

          <v-textarea
            v-model="detailsDialog.notes"
            label="Notes"
            placeholder="Add your notes about this recommendation..."
            rows="3"
            variant="outlined"
            class="mt-3"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailsDialog.open = false">Close</v-btn>
          <v-btn
            color="primary"
            :loading="savingFeedback"
            @click="saveFeedback"
          >
            Save Feedback
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

/* Inject APIs */
const toast = inject('toast')?.show
const $companiesApi = inject('$companiesApi')

/* User Store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

/* State */
const loading = ref(false)
const savingFeedback = ref(false)
const recommendations = ref([])
const statusFilter = ref('all')
const minConfidence = ref(0)

/* Filter Options */
const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'New', value: 'new' },
  { title: 'Viewed', value: 'viewed' },
  { title: 'Contacted', value: 'contacted' },
  { title: 'Interested', value: 'interested' }
]

const confidenceOptions = [
  { title: 'All', value: 0 },
  { title: '50%+', value: 0.5 },
  { title: '75%+', value: 0.75 },
  { title: '90%+', value: 0.9 }
]

/* Details Dialog */
const detailsDialog = reactive({
  open: false,
  recommendation: null,
  rating: 0,
  notes: ''
})

/* Helper Functions */
function formatLocation(location) {
  if (!location) return ''
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.join(', ')
}

function formatAttributeName(key) {
  return key
    .split(/(?=[A-Z])/)
    .join(' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function getConfidenceColor(score) {
  if (!score) return 'grey'
  if (score >= 0.8) return 'success'
  if (score >= 0.6) return 'warning'
  return 'error'
}

function getStatusColor(status) {
  const colors = {
    new: 'info',
    viewed: 'primary',
    contacted: 'warning',
    interested: 'success',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

/* API Calls */
async function fetchRecommendations() {
  if (!user.value?.companyId) return

  loading.value = true
  try {
    let url = '/recommendations'
    const params = { companyId: user.value.companyId }

    // Apply filters
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }
    if (minConfidence.value > 0) {
      params.minScore = minConfidence.value
      url = '/recommendations/high-confidence'
    }

    const response = await $companiesApi.get(url, { params })
    recommendations.value = response.data.map(rec => ({
      ...rec,
      showReasoning: false
    }))
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    toast?.({ message: 'Failed to load recommendations', error: true })
  } finally {
    loading.value = false
  }
}

async function markAsViewed(recommendation) {
  try {
    const response = await $companiesApi.post(
      `/recommendations/${recommendation.id}/viewed`
    )

    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index !== -1) {
      recommendations.value[index] = { ...response.data, showReasoning: false }
    }

    toast?.({ message: 'Marked as viewed' })
  } catch (error) {
    console.error('Error marking as viewed:', error)
    toast?.({ message: 'Failed to update status', error: true })
  }
}

async function markAsContacted(recommendation) {
  try {
    const response = await $companiesApi.post(
      `/recommendations/${recommendation.id}/contacted`
    )

    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index !== -1) {
      recommendations.value[index] = { ...response.data, showReasoning: false }
    }

    toast?.({ message: 'Marked as contacted' })
  } catch (error) {
    console.error('Error marking as contacted:', error)
    toast?.({ message: 'Failed to update status', error: true })
  }
}

function openDetails(recommendation) {
  detailsDialog.recommendation = recommendation
  detailsDialog.rating = recommendation.userRating || 0
  detailsDialog.notes = recommendation.userNotes || ''
  detailsDialog.open = true
}

async function saveFeedback() {
  if (!detailsDialog.recommendation) return

  savingFeedback.value = true
  try {
    const response = await $companiesApi.post(
      `/recommendations/${detailsDialog.recommendation.id}/feedback`,
      {
        rating: detailsDialog.rating || null,
        notes: detailsDialog.notes || null
      }
    )

    const index = recommendations.value.findIndex(
      r => r.id === detailsDialog.recommendation.id
    )
    if (index !== -1) {
      recommendations.value[index] = { ...response.data, showReasoning: false }
    }

    detailsDialog.open = false
    toast?.({ message: 'Feedback saved' })
  } catch (error) {
    console.error('Error saving feedback:', error)
    toast?.({ message: 'Failed to save feedback', error: true })
  } finally {
    savingFeedback.value = false
  }
}

/* Lifecycle */
onMounted(() => {
  fetchRecommendations()
})
</script>

<style scoped>
.recommendation-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow:
    0 1px 1px rgba(0,0,0,0.02),
    0 8px 24px rgba(0,0,0,0.06);
}

.table-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding: 10px;
}

@media (max-width: 700px) {
  .table-title {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .title-bottom {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
}

.confidence-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.match-attributes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attribute-item {
  display: grid;
  grid-template-columns: 140px 1fr 50px;
  gap: 12px;
  align-items: center;
}

.attribute-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.attribute-value {
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>