<!-- src/components/BrandPanel.vue -->
<template>
  <!-- Header / CTA -->
  <div class="table-title">
    <div>
      <div class="text-h6">Brand Profile</div>
      <div class="text-caption text-medium-emphasis">
        Manage the public-facing details of your brand.
      </div>
    </div>
    <div class="d-flex ga-2 title-bottom">
      <v-chip
        size="small"
        :color="isProfileVerified ? 'success' : 'warning'"
        label
      >
        {{ isProfileVerified ? 'Profile: Verified' : 'Profile: Unverified' }}
      </v-chip>
      <v-chip
        size="small"
        color="info"
        label
      >
        {{ completionScore }}% Complete
      </v-chip>
      <v-btn
        color="primary"
        :prepend-icon="isProfileVerified ? 'mdi-pencil' : 'mdi-rocket-launch-outline'"
        @click="openWizard()"
      >
        {{ isProfileVerified ? 'Edit Profile' : 'Build Profile' }}
      </v-btn>
    </div>
  </div>

  <!-- Loading / Empty states -->
  <v-row align="start" dense class="mt-2">
    <!-- LEFT: Brand / Overview -->
    <v-col cols="12" md="8">
      <v-skeleton-loader
        v-if="loading"
        class="mt-6"
        type="card, list-item-two-line, image"
      />
      <div v-else-if="!brand" class="mt-8 text-center">
        <div class="text-subtitle-1 mb-2">No brand linked yet</div>
        <div class="text-body-2">Join or create a brand first.</div>
      </div>

      <!-- Brand Summary -->
      <v-row v-else dense>
        <v-col cols="12">
          <v-card class="product-card">
            <v-card-text>
              <div class="d-flex ga-4 align-start">
                <v-avatar size="72" rounded="lg" class="elevation-1">
                  <v-img :src="profile.logo || placeholderLogo" cover />
                </v-avatar>
                <div class="flex-1">
                  <div class="text-h6 truncate">{{ brand.name }}</div>
                  <div class="text-body-2 text-medium-emphasis truncate">
                    {{ profile.tagline || 'Add a short tagline' }}
                  </div>
                  <div class="mt-2 d-flex align-center ga-2 flex-wrap">
                    <v-chip
                      v-for="cat in profile.categories"
                      :key="cat"
                      size="x-small"
                      label
                      variant="tonal"
                    >
                      {{ cat }}
                    </v-chip>
                    <v-chip v-if="brand.industry" size="x-small" label variant="tonal">
                      {{ brand.industry }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="meta-line">
                <v-icon size="18" class="mr-2">mdi-web</v-icon>
                <a
                  v-if="brand.website"
                  class="text-primary truncate"
                  :href="brand.website"
                  target="_blank"
                  rel="noopener"
                >
                  {{ brand.website }}
                </a>
                <span v-else class="text-medium-emphasis">Add website</span>
              </div>
              <div class="meta-line">
                <v-icon size="18" class="mr-2">mdi-email-outline</v-icon>
                <span class="truncate">{{ brand.contact_email || 'Add contact email' }}</span>
              </div>
              <div class="meta-line">
                <v-icon size="18" class="mr-2">mdi-map-marker-outline</v-icon>
                <template v-if="brand.hq_location">
                  <a
                    class="truncate text-primary"
                    :href="mapHref(brand.hq_location)"
                    target="_blank"
                    rel="noopener"
                    :title="brand.hq_location"
                  >
                    {{ brand.hq_location }}
                  </a>
                </template>
                <span v-else class="text-medium-emphasis">Add HQ location</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Key Details -->
        <v-col cols="12" md="12">
          <v-card class="product-card overview-card">
            <v-card-title class="py-3 d-flex align-center">
              <v-icon class="mr-2">mdi-text-box-outline</v-icon>
              Overview
            </v-card-title>

            <v-card-text class="pt-0">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Description</div>
                    <div class="kv__value clamp-3">
                      {{ profile.description || 'Add a short description about your brand and products.' }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Price Tier</div>
                    <div class="kv__value">
                      <v-chip
                        v-if="profile.price_tier"
                        size="small"
                        label
                        class="chip-tonal"
                      >{{ profile.price_tier }}</v-chip>
                      <span v-else class="empty-pill">Unset</span>
                    </div>
                  </div>

                  <div class="kv mt-4">
                    <div class="kv__label">Sales Channels</div>
                    <div class="kv__value">
                      <template v-if="profile.sales_channels?.length">
                        <v-chip
                          v-for="s in profile.sales_channels"
                          :key="s"
                          size="x-small"
                          class="mr-1 mb-1 chip-tonal"
                          label
                        >{{ s }}</v-chip>
                      </template>
                      <span v-else class="empty-pill">Unset</span>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-6 soft-divider" />

              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Target Markets</div>
                    <div class="kv__value">
                      <template v-if="profile.target_markets?.length">
                        <v-chip
                          v-for="t in profile.target_markets"
                          :key="t"
                          size="x-small"
                          class="mr-1 mb-1 chip-tonal"
                          label
                        >{{ t }}</v-chip>
                      </template>
                      <span v-else class="empty-pill">Unset</span>
                    </div>
                  </div>

                  <div class="kv mt-4">
                    <div class="kv__label">Categories</div>
                    <div class="kv__value">
                      <template v-if="profile.categories?.length">
                        <v-chip
                          v-for="c in profile.categories"
                          :key="c"
                          size="x-small"
                          class="mr-1 mb-1 chip-tonal"
                          label
                        >{{ c }}</v-chip>
                      </template>
                      <span v-else class="empty-pill">Unset</span>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Wholesale</div>
                    <div class="kv__value grid-2">
                      <div><span class="muted">MOQ</span> <strong>{{ profile.wholesale?.moq ?? 'â€”' }}</strong></div>
                      <div><span class="muted">Lead Time</span> <strong>{{ profile.wholesale?.lead_time ?? 'â€”' }}</strong></div>
                      <div><span class="muted">Case Pack</span> <strong>{{ profile.wholesale?.case_pack ?? 'â€”' }}</strong></div>
                    </div>
                  </div>

                  <div class="kv mt-4">
                    <div class="kv__label">Fulfillment</div>
                    <div class="kv__value">
                      {{ profile.fulfillment || 'Unset' }}
                    </div>
                  </div>

                  <div class="kv mt-4">
                    <div class="kv__label">Returns</div>
                    <div class="kv__value">
                      {{ profile.return_policy || 'Unset' }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-6 soft-divider" />

              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Social</div>
                    <div class="kv__value">
                      <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-instagram</v-icon>
                        <template v-if="profile.socials?.instagram">
                          <a
                            class="truncate"
                            :href="socialHref('instagram', profile.socials.instagram)"
                            target="_blank"
                            rel="noopener noreferrer"
                          >{{ profile.socials.instagram }}</a>
                        </template>
                        <template v-else><span class="truncate">â€”</span></template>
                      </div>

                      <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-facebook</v-icon>
                        <template v-if="profile.socials?.facebook">
                          <a
                            class="truncate"
                            :href="socialHref('facebook', profile.socials.facebook)"
                            target="_blank"
                            rel="noopener noreferrer"
                          >{{ profile.socials.facebook }}</a>
                        </template>
                        <template v-else><span class="truncate">â€”</span></template>
                      </div>

                      <div class="meta-line">
                        <v-icon size="18" class="mr-2">mdi-linkedin</v-icon>
                        <template v-if="profile.socials?.linkedin">
                          <a
                            class="truncate"
                            :href="socialHref('linkedin', profile.socials.linkedin)"
                            target="_blank"
                            rel="noopener noreferrer"
                          >{{ profile.socials.linkedin }}</a>
                        </template>
                        <template v-else><span class="truncate">â€”</span></template>
                      </div>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Brand Style</div>
                    <div class="kv__value">
                      <div class="swatch-line">
                        <span class="muted">Primary</span>
                        <span class="swatch" :style="{ background: profile.style?.primary_color || '#5B9279' }"></span>
                        <code class="code-badge">{{ profile.style?.primary_color || '#5B9279' }}</code>
                      </div>
                      <div class="swatch-line">
                        <span class="muted">Secondary</span>
                        <span class="swatch" :style="{ background: profile.style?.secondary_color || '#12130F' }"></span>
                        <code class="code-badge">{{ profile.style?.secondary_color || '#12130F' }}</code>
                      </div>
                      <div class="mt-2"><span class="muted">Tone</span> â€” {{ profile.style?.tone || 'â€”' }}</div>
                      <div class="mt-1"><span class="muted">Packaging</span> â€” {{ profile.style?.packaging || 'â€”' }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
    
    <v-col cols="12" md="4">
      <product-sidebar class="brand-sidebar" />
    </v-col>
  </v-row>

  <!-- Wizard Dialog -->
  <brand-wizard
    v-model:open="wizardOpen"
    :initial-profile="companyProfile || {}"
    :completed="isProfileVerified"
    :mode-title="wizardModeTitle"
    @save="onWizardSave"
    @cancel="() => (wizardOpen = false)"
  />
</template>

<script setup>
/* Imports */
import { useCompanyStore } from '@/store/company'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref } from 'vue'
import BrandWizard from './BrandWizard.vue'
import ProductSidebar from './ProductSidebar.vue'

/* Stores & injections */
const userStore = useUserStore()
const companyStore = useCompanyStore()
const { user } = storeToRefs(userStore)
const { company, companyProfile, isProfileVerified, completionScore } = storeToRefs(companyStore)
const toast = inject('toast')?.show

/* State */
const loading = ref(false)
const wizardOpen = ref(false)

/* Computed */
const placeholderLogo = 'https://dummyimage.com/240x240/eeeeee/aaaaaa.png&text=Logo'
const wizardModeTitle = computed(() => (isProfileVerified.value ? 'Edit Brand Profile' : 'Build Brand Profile'))

// Map store data to template-friendly structure
const profile = computed(() => {
  if (!companyProfile.value) {
    return {
      logo: '',
      tagline: '',
      description: '',
      price_tier: '',
      sales_channels: [],
      target_markets: [],
      categories: [],
      wholesale: { moq: '', lead_time: '', case_pack: '' },
      fulfillment: '',
      return_policy: '',
      socials: { instagram: '', facebook: '', linkedin: '' },
      style: { primary_color: '', secondary_color: '', tone: '', packaging: '' }
    }
  }
  
  const p = companyProfile.value
  return {
    logo: p.coreIdentity?.logo || '',
    tagline: p.coreIdentity?.tagline || '',
    description: p.coreIdentity?.description || '',
    price_tier: p.marketPositioning?.priceTier || '',
    sales_channels: p.marketPositioning?.salesChannels || [],
    target_markets: p.marketPositioning?.targetMarkets || [],
    categories: p.coreIdentity?.categories || [],
    wholesale: {
      moq: p.wholesaleOperations?.moq || '',
      lead_time: p.wholesaleOperations?.leadTime || '',
      case_pack: p.wholesaleOperations?.casePackSize || ''
    },
    fulfillment: p.operations?.fulfillmentMethod || '',
    return_policy: p.operations?.returnPolicy || '',
    socials: {
      instagram: p.socialMedia?.instagram || '',
      facebook: p.socialMedia?.facebook || '',
      linkedin: p.socialMedia?.linkedin || ''
    },
    style: {
      primary_color: p.brandStyle?.primaryColor || '',
      secondary_color: p.brandStyle?.secondaryColor || '',
      tone: p.brandStyle?.brandTone?.[0] || '',
      packaging: p.brandStyle?.packagingStyle || ''
    }
  }
})

// Map company to brand for template
const brand = computed(() => {
  if (!company.value) return null
  const p = companyProfile.value
  return {
    id: company.value.id,
    name: company.value.name || p?.coreIdentity?.brandName,
    website: p?.coreIdentity?.website,
    category: p?.coreIdentity?.productCategory,
    industry: p?.coreIdentity?.industry,
    hq_location: p?.coreIdentity?.hqLocation,
    contact_email: p?.coreIdentity?.contactEmail
  }
})

/* Helper functions */
function socialHref(platform, value) {
  if (!value) return ''
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v

  const handle = v.replace(/^@/, '')

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`
    case 'facebook':
      return `https://facebook.com/${handle}`
    case 'linkedin':
      const path = /^(company|in)\//i.test(handle) ? handle : `company/${handle}`
      return `https://linkedin.com/${path}`
    default:
      return ''
  }
}

function mapHref(address) {
  if (!address) return ''
  const q = encodeURIComponent(address.trim())
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)

  if (isIOS) return `maps://?q=${q}`
  if (isAndroid) return `geo:0,0?q=${q}`
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

/* Lifecycle */
onMounted(async () => {
  loading.value = true
  try {
    const companyId = user.value?.companyId
    if (!companyId) {
      toast?.({ message: 'No company associated with user', error: true })
      return
    }

    // Fetch company from store (uses cache automatically!)
    await companyStore.fetchCompany(companyId)
    
  } catch (error) {
    console.error('Failed to load company:', error)
    toast?.({ message: 'Failed to load company data', error: true })
  } finally {
    loading.value = false
  }
})

/* Wizard */
function openWizard() {
  wizardOpen.value = true
}

async function onWizardSave(profileUpdates) {
  
  try {
    // The wizard now emits the correct nested structure directly!
    await companyStore.updateCompanyProfile(company.value.id, profileUpdates)
    
    // Recalculate completion score after save
    const updatedCompany = await companyStore.fetchCompany(company.value.id, true)
    
    toast?.({ message: 'Brand profile saved successfully!' })
    wizardOpen.value = false
  } catch (error) {
    console.error('Failed to save profile:', error)
    toast?.({ message: 'Failed to save profile', error: true })
  }
}
</script>

<style scoped>
/* ... keep all existing styles ... */
.product-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.overview-card .v-card-title {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
}

.brand-sidebar {
  position: sticky;
  top: 12px;
}

.soft-divider {
  border-color: rgba(0,0,0,0.06) !important;
}

.kv__label {
  font-size: 0.75rem;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
}

.kv__value {
  font-size: 0.95rem;
  color: rgba(0,0,0,0.86);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

@media (max-width: 960px) {
  .grid-2 { grid-template-columns: 1fr; }
}

.chip-tonal {
  background: rgba(91, 146, 121, 0.12);
  border: 1px solid rgba(91, 146, 121, 0.28);
}

.empty-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: rgba(0,0,0,0.55);
  border: 1px dashed rgba(0,0,0,0.25);
  background: rgba(0,0,0,0.02);
}

.meta-line {
  display: flex;
  align-items: center;
  line-height: 1.3;
  margin-bottom: 6px;
  min-height: 28px;
}

.meta-line .v-icon { opacity: 0.7; }

.swatch-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
}

.swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
}

.code-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: .75rem;
  padding: 2px 6px;
  background: rgba(0,0,0,0.04);
  color: rgba(0,0,0,0.8);
  border-radius: 6px;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.muted {
  color: rgba(0,0,0,0.56);
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
    align-items: center;
    text-align: center;
    gap: 12px;
  }
}
</style>