<!-- src/components/BrandProfile/BrandStyleSection.vue -->
<template>
  <v-card class="product-card">
    <v-card-title class="py-3 d-flex align-center">
      <v-icon class="mr-2">mdi-palette-outline</v-icon>
      {{ title || 'Brand Style & Social' }}
    </v-card-title>

    <v-card-text class="pt-0">
      <!-- EDIT MODE -->
      <v-row v-if="editable" dense>
        <!-- Brand Colors & Style -->
        <v-col cols="12">
          <div class="text-subtitle-2 mb-2">Brand Style</div>
        </v-col>

        <!-- Primary Color -->
        <v-col v-if="showStyleField('primaryColor')" cols="12" sm="6">
          <v-text-field
            :model-value="localStyle.primaryColor"
            @update:model-value="updateStyleField('primaryColor', $event)"
            label="Primary Color (hex)"
            placeholder="#5B9279"
            density="comfortable"
          >
            <template #prepend-inner>
              <div
                class="color-preview"
                :style="{ background: localStyle.primaryColor || '#5B9279' }"
              />
            </template>
          </v-text-field>
        </v-col>

        <!-- Secondary Color -->
        <v-col v-if="showStyleField('secondaryColor')" cols="12" sm="6">
          <v-text-field
            :model-value="localStyle.secondaryColor"
            @update:model-value="updateStyleField('secondaryColor', $event)"
            label="Secondary Color (hex)"
            placeholder="#12130F"
            density="comfortable"
          >
            <template #prepend-inner>
              <div
                class="color-preview"
                :style="{ background: localStyle.secondaryColor || '#12130F' }"
              />
            </template>
          </v-text-field>
        </v-col>

        <!-- Brand Tone -->
        <v-col v-if="showStyleField('brandTone')" cols="12">
          <div class="mb-2 text-caption text-uppercase">Brand Tone</div>
          <div>
            <v-chip
              v-for="tone in brandToneOptions"
              :key="tone"
              label
              variant="elevated"
              class="mr-2 mb-2"
              :color="(localStyle.brandTone || []).includes(tone) ? 'primary' : undefined"
              @click="toggleTone(tone)"
            >
              {{ tone }}
            </v-chip>
          </div>
        </v-col>

        <!-- Packaging Style -->
        <v-col v-if="showStyleField('packagingStyle')" cols="12">
          <v-text-field
            :model-value="localStyle.packagingStyle"
            @update:model-value="updateStyleField('packagingStyle', $event)"
            label="Packaging Style"
            placeholder="e.g., Recyclable kraft boxes with minimal branding"
            density="comfortable"
          />
        </v-col>

        <!-- Social Media -->
        <template v-if="showSocialFields">
          <v-col cols="12">
            <v-divider class="my-2" />
            <div class="text-subtitle-2 mb-2">Social Media</div>
          </v-col>

          <v-col v-if="showSocialField('instagram')" cols="12" sm="8">
            <v-text-field
              :model-value="localSocial.instagram"
              @update:model-value="updateSocialField('instagram', $event)"
              label="Instagram"
              placeholder="e.g., @yourbrand"
              prepend-inner-icon="mdi-instagram"
              clearable
              density="comfortable"
            />
          </v-col>

          <v-col v-if="showSocialField('facebook')" cols="12" sm="8">
            <v-text-field
              :model-value="localSocial.facebook"
              @update:model-value="updateSocialField('facebook', $event)"
              label="Facebook"
              placeholder="e.g., yourbrandpage"
              prepend-inner-icon="mdi-facebook"
              clearable
              density="comfortable"
            />
          </v-col>

          <v-col v-if="showSocialField('linkedin')" cols="12" sm="8">
            <v-text-field
              :model-value="localSocial.linkedin"
              @update:model-value="updateSocialField('linkedin', $event)"
              label="LinkedIn"
              placeholder="e.g., company/yourbrand"
              prepend-inner-icon="mdi-linkedin"
              clearable
              density="comfortable"
            />
          </v-col>
        </template>
      </v-row>

      <!-- DISPLAY MODE -->
      <v-row v-else dense>
        <!-- Brand Colors & Style -->
        <v-col cols="12" md="6">
          <div class="kv">
            <div class="kv__label">Brand Colors</div>
            <div class="kv__value">
              <div class="swatch-line">
                <span class="muted">Primary</span>
                <span
                  class="swatch"
                  :style="{ background: profile.brandStyle?.primaryColor || '#5B9279' }"
                ></span>
                <code class="code-badge">
                  {{ profile.brandStyle?.primaryColor || '#5B9279' }}
                </code>
              </div>
              <div class="swatch-line">
                <span class="muted">Secondary</span>
                <span
                  class="swatch"
                  :style="{ background: profile.brandStyle?.secondaryColor || '#12130F' }"
                ></span>
                <code class="code-badge">
                  {{ profile.brandStyle?.secondaryColor || '#12130F' }}
                </code>
              </div>
            </div>
          </div>

          <div class="kv mt-4">
            <div class="kv__label">Brand Tone</div>
            <div class="kv__value">
              <template v-if="profile.brandStyle?.brandTone?.length">
                <v-chip
                  v-for="tone in profile.brandStyle.brandTone"
                  :key="tone"
                  size="x-small"
                  class="mr-1 mb-1 chip-tonal"
                  label
                >
                  {{ tone }}
                </v-chip>
              </template>
              <span v-else>—</span>
            </div>
          </div>

          <div class="kv mt-4">
            <div class="kv__label">Packaging Style</div>
            <div class="kv__value">
              {{ profile.brandStyle?.packagingStyle || '—' }}
            </div>
          </div>
        </v-col>

        <!-- Social Media Links -->
        <v-col cols="12" md="6">
          <div class="kv">
            <div class="kv__label">Social Media</div>
            <div class="kv__value">
              <!-- Instagram -->
              <div class="social-line">
                <v-icon size="18" class="mr-2" color="#E4405F">mdi-instagram</v-icon>
                <template v-if="profile.socialMedia?.instagram">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('instagram', profile.socialMedia.instagram)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.instagram }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>

              <!-- Facebook -->
              <div class="social-line">
                <v-icon size="18" class="mr-2" color="#1877F2">mdi-facebook</v-icon>
                <template v-if="profile.socialMedia?.facebook">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('facebook', profile.socialMedia.facebook)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.facebook }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>

              <!-- LinkedIn -->
              <div class="social-line">
                <v-icon size="18" class="mr-2" color="#0A66C2">mdi-linkedin</v-icon>
                <template v-if="profile.socialMedia?.linkedin">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('linkedin', profile.socialMedia.linkedin)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.linkedin }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>

              <!-- Twitter -->
              <div class="social-line">
                <v-icon size="18" class="mr-2" color="#1DA1F2">mdi-twitter</v-icon>
                <template v-if="profile.socialMedia?.twitter">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('twitter', profile.socialMedia.twitter)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.twitter }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>

              <!-- YouTube -->
              <div class="social-line">
                <v-icon size="18" class="mr-2" color="#FF0000">mdi-youtube</v-icon>
                <template v-if="profile.socialMedia?.youtube">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('youtube', profile.socialMedia.youtube)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.youtube }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>

              <!-- TikTok -->
              <div class="social-line">
                <v-icon size="18" class="mr-2">mdi-music-note</v-icon>
                <template v-if="profile.socialMedia?.tiktok">
                  <a
                    class="truncate text-primary"
                    :href="socialHref('tiktok', profile.socialMedia.tiktok)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ profile.socialMedia.tiktok }}
                  </a>
                </template>
                <span v-else class="muted truncate">—</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  styleValue: {
    type: Object,
    default: () => ({})
  },
  socialValue: {
    type: Object,
    default: () => ({})
  },
  styleFields: {
    type: Array,
    default: () => ['primaryColor', 'secondaryColor', 'brandTone', 'packagingStyle']
  },
  socialFields: {
    type: Array,
    default: () => ['instagram', 'facebook', 'linkedin']
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:styleValue', 'update:socialValue'])

// Brand tone options
const brandToneOptions = [
  'Professional',
  'Friendly',
  'Playful',
  'Minimal',
  'Technical',
  'Luxury',
  'Casual',
  'Bold',
  'Sophisticated',
  'Edgy'
]

// Local values for editing
const localStyle = computed(() => ({
  primaryColor: '',
  secondaryColor: '',
  brandTone: [],
  packagingStyle: '',
  ...props.styleValue
}))

const localSocial = computed(() => ({
  instagram: '',
  facebook: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  ...props.socialValue
}))

// Helpers to check if fields should be shown
function showStyleField(fieldName) {
  return props.styleFields.includes(fieldName)
}

function showSocialField(fieldName) {
  return props.socialFields.includes(fieldName)
}

const showSocialFields = computed(() => {
  return props.socialFields.length > 0
})

// Update style field
function updateStyleField(field, value) {
  emit('update:styleValue', { ...localStyle.value, [field]: value })
}

// Update social field
function updateSocialField(field, value) {
  emit('update:socialValue', { ...localSocial.value, [field]: value })
}

// Toggle tone
function toggleTone(tone) {
  const tones = [...(localStyle.value.brandTone || [])]
  const index = tones.indexOf(tone)
  
  if (index >= 0) {
    tones.splice(index, 1)
  } else {
    tones.push(tone)
  }
  
  emit('update:styleValue', { ...localStyle.value, brandTone: tones })
}

// Social href helper
function socialHref(platform, value) {
  if (!value) return ''
  
  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(value)) return value

  // Extract handle (remove @ if present)
  const handle = value.replace(/^@/, '').trim()

  const baseUrls = {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    linkedin: 'https://linkedin.com/',
    twitter: 'https://twitter.com/',
    youtube: 'https://youtube.com/',
    tiktok: 'https://tiktok.com/'
  }

  return baseUrls[platform] ? `${baseUrls[platform]}${handle}` : value
}
</script>

<style scoped>
.product-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.product-card .v-card-title {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
}

.kv__label {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
}

.kv__value {
  font-size: 0.95rem;
  color: rgba(0,0,0,0.86);
}

.swatch-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
}

.swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
  margin-right: 8px;
}

.code-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  padding: 2px 6px;
  background: rgba(0,0,0,0.04);
  color: rgba(0,0,0,0.8);
  border-radius: 6px;
}

.social-line {
  display: flex;
  align-items: center;
  line-height: 1.3;
  margin-bottom: 8px;
  min-height: 28px;
}

.social-line .v-icon {
  flex-shrink: 0;
}

.muted {
  color: rgba(0,0,0,0.56);
  font-size: 0.85rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-tonal {
  background: rgba(91, 146, 121, 0.12);
  border: 1px solid rgba(91, 146, 121, 0.28);
}
</style>