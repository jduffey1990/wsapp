<template>
    <v-row class="mt-2 matches-card" dense>
      <!-- LEFT: Matches -->
      <v-col cols="12" md="4" lg="3" >
        <v-card class="sidebar-card">
          <v-card-title class="py-3 d-flex align-center justify-space-between">
            <span>Wholesale Matches</span>
            <v-chip size="x-small" label variant="tonal">
              {{ matches.length }}
            </v-chip>
          </v-card-title>
          <v-divider class="soft-divider" />

          <v-card-text class="pt-2">
            <div v-if="!matches.length" class="text-body-2 text-medium-emphasis">
              No matches yet.
            </div>

            <div
              v-for="m in matchesSorted"
              :key="m.id"
              class="match-card"
              :class="{ selected: m.id === selectedMatchId }"
              @click="selectMatch(m)"
            >
              <div class="match-title truncate">{{ m.storeName }}</div>
              <div class="text-caption text-medium-emphasis">
                Created {{ formatDate(m.createdAt) }}
              </div>
              <div class="mt-1">
                <a class="text-primary text-caption" :href="m.mapsUrl" target="_blank" rel="noopener">
                  View on Google Maps
                </a>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT: Selected match detail -->
      <v-col cols="12" md="8" lg="9">
        <v-card class="product-card">
          <v-card-title class="py-3">
            <template v-if="selectedMatch">
              {{ selectedMatch.storeName }}
              <v-chip class="ml-2" size="x-small" label variant="tonal">
                Score: {{ selectedMatch.score }}
              </v-chip>
            </template>
            <template v-else>
              Match Details
            </template>
          </v-card-title>

          <v-divider class="soft-divider" />

          <v-card-text>
            <template v-if="selectedMatch">
              <!-- Radar (just data points) -->
              <div class="table-title mb-2">
                <div class="text-subtitle-1">Fit by Attribute</div>
              </div>
              <RadarChart :points="selectedMatch.radarPoints" :name="selectedMatch.storeName" class="mb-4" />

              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Address</div>
                    <div class="kv__value">{{ selectedMatch.address || '—' }}</div>
                  </div>

                  <div class="kv mt-3">
                    <div class="kv__label">Category</div>
                    <div class="kv__value">{{ selectedMatch.category || '—' }}</div>
                  </div>

                  <div class="kv mt-3">
                    <div class="kv__label">Phone</div>
                    <div class="kv__value">{{ selectedMatch.phone || '—' }}</div>
                  </div>

                  <div class="kv mt-3">
                    <div class="kv__label">Website</div>
                    <div class="kv__value">
                      <a v-if="selectedMatch.website" :href="selectedMatch.website" target="_blank" rel="noopener">
                        {{ selectedMatch.website }}
                      </a>
                      <span v-else>—</span>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="kv">
                    <div class="kv__label">Buyer Contact</div>
                    <div class="kv__value">{{ selectedMatch.buyerContact || '—' }}</div>
                  </div>

                  <div class="kv mt-3">
                    <div class="kv__label">Notes</div>
                    <div class="kv__value clamp-4">{{ selectedMatch.notes || '—' }}</div>
                  </div>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <div class="text-body-2 text-medium-emphasis">
                Select a match on the left to view details.
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RadarChart from '@/components/RadarChart.vue'

/* State */
const matches = ref([])
const selectedMatchId = ref(null)

/* Derived */
const matchesSorted = computed(() =>
  [...matches.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)
const selectedMatch = computed(() =>
  matches.value.find(m => m.id === selectedMatchId.value) || null
)

/* Loaders (mocked with full seeded details) */
onMounted(async () => {
  await loadMatches()
})

async function loadMatches () {
  const now = Date.now()
  // Seed complete records (including radarPoints and contact fields)
  const rows = [
    mkMatch(
      'Summit Outfitters', now - 10 * 60 * 1000,
      'Outdoor retailer focused on technical apparel', 87,
      {
        address: '1840 Cascade Ave, Boulder, CO',
        phone: '(303) 555-0198',
        website: 'https://summitoutfitters.example',
        buyerContact: 'Lena Myers — lena@summitoutfitters.example',
        radarPoints: [74, 62, 88, 71, 54, 80, 69]
      }
    ),
    mkMatch(
      'City Threads Boutique', now - 60 * 60 * 1000,
      'Urban boutique with premium basics', 79,
      {
        address: '92 Grove St, Brooklyn, NY',
        phone: '(718) 555-0119',
        website: 'https://citythreads.example',
        buyerContact: 'Rashad Patel — rashad@citythreads.example',
        radarPoints: [58, 76, 83, 65, 60, 72, 50]
      }
    ),
    mkMatch(
      'Trail & Timber Co.', now - 2 * 3600 * 1000,
      'Regional chain; performance-first assortment', 73,
      {
        address: '507 Pine Ridge Rd, Bend, OR',
        phone: '(541) 555-0137',
        website: 'https://trailandtimber.example',
        buyerContact: 'Morgan Chen — morgan@trailandtimber.example',
        radarPoints: [62, 61, 80, 68, 66, 58, 72]
      }
    ),
    mkMatch(
      'Northside General Store', now - 6 * 3600 * 1000,
      'Neighborhood shop, mixed goods', 65,
      {
        address: '14 Oak St, Madison, WI',
        phone: '(608) 555-0146',
        website: 'https://northsidegeneral.example',
        buyerContact: 'Devon Park — devon@northsidegeneral.example',
        radarPoints: [52, 55, 64, 59, 70, 48, 63]
      }
    ),
    mkMatch(
      'Harbor Mercantile', now - 12 * 3600 * 1000,
      'Tourist-forward general store', 58,
      {
        address: '3 Wharf Rd, Bar Harbor, ME',
        phone: '(207) 555-0173',
        website: 'https://harbormercantile.example',
        buyerContact: 'Avery Bloom — avery@harbormercantile.example',
        radarPoints: [45, 68, 58, 57, 62, 44, 55]
      }
    )
  ]

  matches.value = rows

  // auto-select most recent
  if (rows.length) {
    const latest = rows.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    selectedMatchId.value = latest.id
  }
}

/* Actions */
function selectMatch (m) {
  selectedMatchId.value = m.id
}

/* Helpers */
function mkMatch (storeName, ts, notes, score, extras = {}) {
  const place = encodeURIComponent(storeName + ' store')
  return {
    id: `m_${Math.random().toString(36).slice(2)}`,
    storeName,
    createdAt: new Date(ts).toISOString(),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place}`,
    category: 'Apparel',
    notes,
    score,
    // seeded fields for the detail pane:
    address: extras.address || '',
    phone: extras.phone || '',
    website: extras.website || '',
    buyerContact: extras.buyerContact || '',
    radarPoints: extras.radarPoints || [0,0,0,0,0,0,0]
  }
}

function formatDate (iso) {
  const d = new Date(iso)
  return d.toLocaleString()
}
</script>

<style scoped>
.sidebar-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
  position: sticky;
}

.product-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.matches-card {
  display: flex;
}

.match-card {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.06);
  margin-bottom: 10px;
  cursor: pointer;
  opacity: 0.6;
  transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease, border-color .18s ease;
  background: rgba(255,255,255,0.5);
}
.match-card:hover { opacity: 0.8; }
.match-card.selected {
  opacity: 1;
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  border-color: rgba(0,0,0,0.12);
  background: white;
}

.match-title { font-weight: 600; }

.kv__label {
  font-size: 0.75rem;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
}
.kv__value { font-size: 0.95rem; color: rgba(0,0,0,0.86); }
.soft-divider { border-color: rgba(0,0,0,0.06) !important; }

.table-title {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 10px;
}

.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }
</style>
