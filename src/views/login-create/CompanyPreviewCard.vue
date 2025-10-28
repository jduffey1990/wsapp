<template>
  <div v-if="data" class="company-preview">
    <!-- Loading State -->
    <v-skeleton-loader
      v-if="loading"
      type="card, list-item-three-line, list-item-two-line"
      class="mb-4"
    />

    <!-- Content -->
    <div v-else>
      <!-- Header Section with Logo/Image -->
      <div class="preview-header d-flex align-start ga-4 mb-4">
        <!-- Company Logo/Image -->
        <div class="flex-shrink-0">
          <v-avatar
            :size="isAddress ? 80 : 64"
            :rounded="isAddress ? 'lg' : 'md'"
            :color="data.meta?.themeColor || 'primary'"
            class="elevation-2"
          >
            <v-img
              v-if="companyImage"
              :src="companyImage"
              :alt="data.name"
              cover
            >
              <template #error>
                <div class="d-flex align-center justify-center h-100 text-h5 font-weight-bold text-white">
                  {{ companyInitial }}
                </div>
              </template>
            </v-img>
            <div v-else class="text-h5 font-weight-bold text-white">
              {{ companyInitial }}
            </div>
          </v-avatar>
        </div>

        <!-- Company Info -->
        <div class="flex-grow-1 min-w-0">
          <!-- Company Name with Badge -->
          <div class="d-flex align-center ga-2 mb-1">
            <h3 class="text-h6 font-weight-bold text-truncate">
              {{ data.name }}
            </h3>
            <v-chip
              v-if="pathwayBadge"
              :color="pathwayBadge.color"
              size="x-small"
              variant="flat"
              class="text-uppercase font-weight-bold"
            >
              {{ pathwayBadge.text }}
            </v-chip>
          </div>

          <!-- Source URL or Type -->
          <div v-if="sourceUrl" class="text-caption text-medium-emphasis mb-2 d-flex align-center ga-1">
            <v-icon size="14" :icon="sourceIcon" />
            <a :href="sourceUrl" target="_blank" class="text-decoration-none text-medium-emphasis">
              {{ sourceDisplay }}
            </a>
          </div>

          <!-- Description -->
          <p v-if="data.shortDescription" class="text-body-2 text-medium-emphasis mb-0 line-clamp-2">
            {{ data.shortDescription }}
          </p>
        </div>
      </div>

      <!-- Key Details Grid -->
      <v-card
        v-if="hasKeyDetails"
        variant="tonal"
        class="mb-4"
      >
        <v-card-text class="pa-3">
          <div class="details-grid">
            <!-- Founded Year -->
            <div v-if="data.foundingYear" class="detail-item">
              <div class="d-flex align-center ga-2">
                <v-icon size="20" color="primary">mdi-calendar-star</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Founded</div>
                  <div class="text-body-2 font-weight-medium">{{ data.foundingYear }}</div>
                </div>
              </div>
            </div>

            <!-- Headquarters -->
            <div v-if="data.headquartersAddress" class="detail-item">
              <div class="d-flex align-center ga-2">
                <v-icon size="20" color="primary">mdi-map-marker</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Headquarters</div>
                  <div class="text-body-2 font-weight-medium">{{ data.headquartersAddress }}</div>
                </div>
              </div>
            </div>

            <!-- CEO (if available) -->
            <div v-if="leaderName" class="detail-item">
              <div class="d-flex align-center ga-2">
                <v-icon size="20" color="primary">mdi-account-tie</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">{{ leaderTitle }}</div>
                  <div class="text-body-2 font-weight-medium">{{ leaderName }}</div>
                </div>
              </div>
            </div>

            <!-- Rating (for address pathway) -->
            <div v-if="data.place?.rating" class="detail-item">
              <div class="d-flex align-center ga-2">
                <v-icon size="20" color="amber">mdi-star</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Rating</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ data.place.rating }} ({{ data.place.reviewsCount }} reviews)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Categories -->
      <div v-if="data.categories?.length" class="mb-4">
        <div class="text-caption text-medium-emphasis mb-2">Categories</div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="(category, idx) in data.categories.slice(0, 5)"
            :key="idx"
            size="small"
            variant="outlined"
            color="primary"
          >
            {{ category }}
          </v-chip>
          <v-chip
            v-if="data.categories.length > 5"
            size="small"
            variant="text"
            color="primary"
          >
            +{{ data.categories.length - 5 }} more
          </v-chip>
        </div>
      </div>

      <!-- Social Links (for URL/LinkedIn pathways) -->
      <div v-if="data.socialLinks?.length" class="mb-4">
        <div class="text-caption text-medium-emphasis mb-2">Social Media</div>
        <div class="d-flex ga-2">
          <v-btn
            v-for="(link, idx) in data.socialLinks"
            :key="idx"
            :href="link"
            target="_blank"
            icon
            size="small"
            variant="tonal"
          >
            <v-icon>{{ getSocialIcon(link) }}</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Place Details (for address pathway) -->
      <v-card v-if="data.place" variant="outlined" class="mb-4">
        <v-card-text class="pa-3">
          <div class="text-caption text-medium-emphasis mb-2">Location Details</div>
          
          <!-- Full Address -->
          <div v-if="data.place.address" class="d-flex align-start ga-2 mb-2">
            <v-icon size="18" class="mt-1">mdi-map-marker-outline</v-icon>
            <div class="text-body-2">{{ data.place.address }}</div>
          </div>

          <!-- Phone -->
          <div v-if="data.place.phone" class="d-flex align-center ga-2 mb-2">
            <v-icon size="18">mdi-phone</v-icon>
            <a :href="`tel:${data.place.phone}`" class="text-body-2 text-decoration-none">
              {{ data.place.phone }}
            </a>
          </div>

          <!-- Map Link -->
          <v-btn
            v-if="data.place.mapLink"
            :href="data.place.mapLink"
            target="_blank"
            variant="tonal"
            size="small"
            prepend-icon="mdi-google-maps"
            block
          >
            View on Google Maps
          </v-btn>

          <!-- Storefront Notice -->
          <v-alert
            v-if="data.isStorefront === true"
            type="info"
            density="compact"
            variant="tonal"
            class="mt-3 mb-0"
          >
            This appears to be a storefront location, not the headquarters.
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Website Link -->
      <v-btn
        v-if="data.website && !isLinkedInUrl(data.website)"
        :href="data.website"
        target="_blank"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-open-in-new"
        block
        class="mb-3"
      >
        Visit Website
      </v-btn>

      <!-- Data Quality Indicators -->
      <div class="d-flex ga-2 justify-center">
        <v-chip
          v-if="data.enrichedWithAI"
          size="x-small"
          variant="text"
          prepend-icon="mdi-robot"
          color="purple"
        >
          AI Enhanced
        </v-chip>
        <v-chip
          v-if="data.hasStructuredData"
          size="x-small"
          variant="text"
          prepend-icon="mdi-database-check"
          color="green"
        >
          Verified Data
        </v-chip>
        <v-chip
          v-if="data.hasGooglePlaces"
          size="x-small"
          variant="text"
          prepend-icon="mdi-google-maps"
          color="blue"
        >
          Google Places
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed Properties
const isUrl = computed(() => props.data?.kind === 'url')
const isLinkedIn = computed(() => props.data?.kind === 'linkedin')
const isAddress = computed(() => props.data?.kind === 'address')

const companyInitial = computed(() => {
  return props.data?.name?.charAt(0)?.toUpperCase() || '?'
})

const companyImage = computed(() => {
  if (!props.data) return null
  
  // For LinkedIn, check if image is hotlink blocked
  if (isLinkedIn.value && props.data.meta?.imageAnalysis?.hotlinkBlocked) {
    return null // Use fallback initials
  }
  
  // Priority: meta.image > image > favicon
  return props.data.meta?.image || props.data.image || props.data.favicon
})

const pathwayBadge = computed(() => {
  if (!props.data) return null
  
  const badges = {
    url: { text: 'Website', color: 'blue' },
    linkedin: { text: 'LinkedIn', color: 'indigo' },
    address: { text: 'Location', color: 'green' }
  }
  
  return badges[props.data.kind] || null
})

const sourceUrl = computed(() => {
  if (!props.data) return null
  
  if (isUrl.value) {
    return props.data.request?.providedUrl || props.data.website
  } else if (isLinkedIn.value) {
    return props.data.request?.providedUrl
  } else if (isAddress.value && props.data.place?.mapLink) {
    return props.data.place.mapLink
  }
  
  return null
})

const sourceDisplay = computed(() => {
  if (!sourceUrl.value) return ''
  
  try {
    const url = new URL(sourceUrl.value)
    if (isAddress.value) return 'View on Google Maps'
    return url.hostname.replace('www.', '')
  } catch {
    return sourceUrl.value
  }
})

const sourceIcon = computed(() => {
  if (isLinkedIn.value) return 'mdi-linkedin'
  if (isAddress.value) return 'mdi-google-maps'
  return 'mdi-web'
})

const hasKeyDetails = computed(() => {
  return !!(
    props.data?.foundingYear ||
    props.data?.headquartersAddress ||
    props.data?.leaderData?.ceo ||
    props.data?.place?.rating
  )
})

const leaderName = computed(() => {
  return props.data?.leaderData?.ceo || props.data?.leaderData?.founder
})

const leaderTitle = computed(() => {
  if (props.data?.leaderData?.ceo) return 'CEO'
  if (props.data?.leaderData?.founder) return 'Founder'
  return 'Leadership'
})

// Helper Functions
function getSocialIcon(url) {
  const lower = url.toLowerCase()
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'mdi-twitter'
  if (lower.includes('facebook.com')) return 'mdi-facebook'
  if (lower.includes('linkedin.com')) return 'mdi-linkedin'
  if (lower.includes('instagram.com')) return 'mdi-instagram'
  if (lower.includes('youtube.com')) return 'mdi-youtube'
  if (lower.includes('github.com')) return 'mdi-github'
  return 'mdi-link'
}

function isLinkedInUrl(url) {
  if (!url) return false
  return url.toLowerCase().includes('linkedin.com')
}
</script>

<style scoped>
.company-preview {
  padding: 4px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  min-width: 0; /* Prevent grid overflow */
}

@media (max-width: 600px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>