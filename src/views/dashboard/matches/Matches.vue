<template>
  <!-- FILTER ROW -->
  <v-row class="mb-2" dense>
    <v-col cols="12">
      <v-card class="filters-card">
        <v-card-text class="pt-4">
          <div class="d-flex ga-2 flex-wrap">
            <v-text-field
              v-model="searchQuery"
              variant="outlined"
              density="comfortable"
              rounded="xl"
              hide-details
              class="flex-1 min-w-[240px]"
              placeholder="Search any retailer"
              prepend-inner-icon="mdi-magnify"
              :loading="searchLoading"
              @keydown.enter="runSearch"
              clearable
              @click:clear="resetSearch"
            />
            <v-btn color="primary" variant="flat" size="small" :loading="searchLoading" @click="runSearch">
              Search
            </v-btn>
            <v-btn v-if="searched" color="secondary" variant="outlined" size="small" @click="resetSearch">
              Clear
            </v-btn>
          </div>
        </v-card-text>
        <v-spacer class="pb-3"></v-spacer>
        <hr></hr>
        <v-spacer class="pb-3"></v-spacer>
        <v-card-text class="py-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3">
            <span>Filter Your Retailers</span>
            <v-chip size="x-small" label variant="tonal">
              {{ activeFilterLabel }}
            </v-chip>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              size="small"
              :variant="activeFilter === 'department' ? 'flat' : 'outlined'"
              color="primary"
              @click="applyFilter('department')"
            >
              Department Stores
            </v-btn>
            <v-btn
              size="small"
              :variant="activeFilter === 'sporting' ? 'flat' : 'outlined'"
              color="primary"
              @click="applyFilter('sporting')"
            >
              Sporting Goods
            </v-btn>
            <v-btn
              size="small"
              :variant="activeFilter === 'outdoor' ? 'flat' : 'outlined'"
              color="primary"
              @click="applyFilter('outdoor')"
            >
              Outdoor
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- MATCHES + DETAIL ROW -->
  <v-row class="mt-2 matches-card" dense>
    <!-- LEFT: Matches -->
    <v-col v-if="!searched" cols="12" md="4" lg="3">
      <v-card class="sidebar-card">
        <v-card-title class="py-3 d-flex align-center justify-space-between">
          <span>{{ listTitle }}</span>
          <v-chip size="x-small" label variant="tonal">
            {{ currentList.length }}
          </v-chip>
        </v-card-title>
        <v-divider class="soft-divider" />

        <v-card-text class="pt-2">
          <v-expansion-panels
            v-model="activePanel"
            class="match-panels"
          >
            <!-- Panel 0: My Matches -->
            <v-expansion-panel value="my">
              <v-expansion-panel-title @toggle="onTitleToggle('my')">
                My Matches
              </v-expansion-panel-title>
              <v-expansion-panel-text>
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
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Panel 1: Top Players -->
            <v-expansion-panel value="top">
              <v-expansion-panel-title @toggle="onTitleToggle('top')">
                Top Players
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div
                  v-for="m in topPlayers"
                  :key="m.id"
                  class="match-card"
                  :class="{ selected: m.id === selectedMatchId }"
                  @click="selectTopPlayer(m)"
                >
                  <div class="match-title truncate">{{ m.storeName }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ m.category || '—' }}
                  </div>
                  <div class="mt-1">
                    <a class="text-primary text-caption" :href="m.mapsUrl" target="_blank" rel="noopener">
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-else cols="12" md="4" lg="3" > 
      <v-card class="sidebar-card"> 
        <v-card-title class="py-3 d-flex align-center justify-space-between"> 
          <span>Search Match</span> 
          <v-chip size="x-small" label variant="tonal"> {{ matches.length }} </v-chip> 
        </v-card-title> 
          <v-divider class="soft-divider" /> 
          <v-card-text class="pt-2"> 
            <div v-if="!matches.length" class="text-body-2 text-medium-emphasis"> 
              No matches yet. 
            </div> 
            <div 
              v-for="m in matchesSorted" 
              :key="m.id" class="match-card" 
              :class="{ selected: m.id === selectedMatchId }" 
              @click="selectMatch(m)" 
            > 
              <div class="match-title truncate">
                {{ m.storeName }}
              </div> 
              <div class="text-caption text-medium-emphasis"> 
                Created {{ formatDate(m.createdAt) }} 
              </div> 
              <div class="mt-1"> 
                <a 
                class="text-primary text-caption" 
                :href="m.mapsUrl" 
                target="_blank" 
                rel="noopener"> View on Google Maps 
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

            <!-- Success Score chip -->
            <v-chip class="ml-2" size="x-small" label variant="tonal">
              Success Score: {{ selectedMatch.successScore }}
              <template #append>
                <v-tooltip text='How successful you will be offering your product at this retailer or "filling an immediate need"' location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-information-outline"
                      size="x-small"
                      variant="text"
                      density="comfortable"
                      aria-label="Success Score info"
                    />
                  </template>
                </v-tooltip>
              </template>
            </v-chip>

            <!-- Match Score chip -->
            <v-chip class="ml-2" size="x-small" label variant="tonal">
              Match Score: {{ selectedMatch.matchScore }}
              <template #append>
                <v-tooltip text='How much overlap you have with a retailer or "how well your brand make-up is already represented at this retailer"' location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-information-outline"
                      size="x-small"
                      variant="text"
                      density="comfortable"
                      aria-label="Match Score info"
                    />
                  </template>
                </v-tooltip>
              </template>
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
            <div class="d-flex justify-center">
              <RadarChart :points="selectedMatch.radarPoints" :name="selectedMatch.storeName" class="mb-4" />
            </div>
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

/* =============== FILTERS (keys -> labels) =============== */
const FILTERS = {
  department: 'Department Stores',
  sporting: 'Sporting Goods',
  outdoor: 'Outdoor',
}

/* =============== NAMES (5 per list) =============== */
const allStores = {
  'Department Stores': {
    matches: [
      'Nordway Department Store',
      'Harborfield',
      'Macyvale',
      'Bloomfell',
      'Dillard & Co.',
    ],
    topPlayers: [
      'Nordstrom',
      "Macy's",
      "Bloomingdale's",
      "Dillard's",
      "Kohl's",
    ],
  },
  'Sporting Goods': {
    matches: [
      'ProEdge Sports',
      'AllPlay Athletics',
      'GearHouse',
      'Varsity Depot',
      'Peak Performance Outlet',
    ],
    topPlayers: [
      "Dick's Sporting Goods",
      'Academy Sports + Outdoors',
      'SCHEELS',
      'Decathlon',
      'Big 5 Sporting Goods',
    ],
  },
  Outdoor: {
    matches: [
      'Summit Outfitters',
      'City Threads Boutique',
      'Trail & Timber Co.',
      'Northside General Store',
      'Harbor Mercantile',
    ],
    topPlayers: [
      'REI Co-op',
      'Backcountry',
      "Cabela's",
      'Bass Pro Shops',
      'Moosejaw',
    ],
  },
}

/* =============== COMPACT METADATA (10 slots per category) ===============
   We randomly pick 5 distinct indices from these 10 for each list.
   Keep the arrays short but complete (10 items each).
========================================================================= */
const metaData = {
  'Department Stores': {
    notes: [
      'Premium apparel curation',
      'Private label strength',
      'National footprint',
      'Upscale editorial merchandising',
      'Regional basics hero',
      'Omnichannel leader',
      'Strong loyalty program',
      'Designer partnerships',
      'Off-price complement',
      'High-traffic flagship',
    ],
    successScores: [88, 84, 80, 76, 74, 72, 70, 68, 66, 64],
    matchScores: [74, 94, 82, 71, 69, 76, 68, 72, 50, 69],
    addresses: [
      '1600 7th Ave, Seattle, WA',
      '151 W 34th St, New York, NY',
      '1000 3rd Ave, New York, NY',
      '3101 W 7th St, Fort Worth, TX',
      'N56W17000 Ridgewood Dr, Menomonee Falls, WI',
      '1 Stockton St, San Francisco, CA',
      '5200 Fashion Ave, Dallas, TX',
      '600 Grand Ave, Chicago, IL',
      '45 State St, Boston, MA',
      '5th Ave, New York, NY',
    ],
    websites: [
      'https://example-dept-1.com',
      'https://example-dept-2.com',
      'https://example-dept-3.com',
      'https://example-dept-4.com',
      'https://example-dept-5.com',
      'https://example-dept-6.com',
      'https://example-dept-7.com',
      'https://example-dept-8.com',
      'https://example-dept-9.com',
      'https://example-dept-10.com',
    ],
  },
  'Sporting Goods': {
    notes: [
      'Team sports & footwear',
      'Wide equipment assortment',
      'Value-forward chain',
      'Scholastic specialist',
      'Outlet concept',
      'Community events focus',
      'Hunt/Fish + active',
      'Endurance sports niche',
      'Action sports mix',
      'Soccer-first assortment',
    ],
    successScores: [88, 84, 80, 76, 74, 72, 70, 68, 66, 64],
    matchScores: [74, 94, 82, 71, 69, 76, 68, 72, 50, 69],
    addresses: [
      '345 Court St, Coraopolis, PA',
      '1800 N Mason Rd, Katy, TX',
      '4550 15th St, Fargo, ND',
      '4 Blvd de Mons, Villeneuve-d’Ascq, FR',
      '2525 E El Segundo Blvd, El Segundo, CA',
      '22 Victory Ln, Columbus, OH',
      '88 Stadium Dr, Kansas City, MO',
      '400 Commerce Rd, Charlotte, NC',
      '901 Campus Way, Ann Arbor, MI',
      '720 Outlet Pkwy, Salt Lake City, UT',
    ],
    websites: [
      'https://example-sport-1.com',
      'https://example-sport-2.com',
      'https://example-sport-3.com',
      'https://example-sport-4.com',
      'https://example-sport-5.com',
      'https://example-sport-6.com',
      'https://example-sport-7.com',
      'https://example-sport-8.com',
      'https://example-sport-9.com',
      'https://example-sport-10.com',
    ],
  },
  Outdoor: {
    notes: [
      'Technical outdoor apparel',
      'Urban outdoor basics',
      'Performance-first assortment',
      'Neighborhood mixed goods',
      'Tourist-forward general store',
      'Co-op specialty',
      'Outdoor eCom specialty',
      'Hunt/Fish/Outdoor',
      'Backcountry specialist',
      'Climbing/Alpine focus',
    ],
    successScores: [88, 84, 80, 76, 74, 72, 70, 68, 66, 64],
    matchScores: [74, 94, 82, 71, 69, 76, 68, 72, 50, 69],
    addresses: [
      '1840 Cascade Ave, Boulder, CO',
      '1678 Redstone Center Dr, Park City, UT',
      '1 Cabela Dr, Sidney, NE',
      '2500 E Kearney St, Springfield, MO',
      '32200 North Ave, Madison Heights, MI',
      '92 Grove St, Brooklyn, NY',
      '507 Pine Ridge Rd, Bend, OR',
      '14 Oak St, Madison, WI',
      '3 Wharf Rd, Bar Harbor, ME',
      '2150 Condor St, Seattle, WA',
    ],
    websites: [
      'https://example-outdoor-1.com',
      'https://example-outdoor-2.com',
      'https://example-outdoor-3.com',
      'https://example-outdoor-4.com',
      'https://example-outdoor-5.com',
      'https://example-outdoor-6.com',
      'https://example-outdoor-7.com',
      'https://example-outdoor-8.com',
      'https://example-outdoor-9.com',
      'https://example-outdoor-10.com',
    ],
  },
}

/* =============== STATE =============== */
const matches = ref([])     // left: My Matches (5)
const topPlayers = ref([])  // left: Top Players (5)
const selectedMatchId = ref(null) // selected tile id (shared for both lists)
const activeFilter = ref('outdoor') // 'department' | 'sporting' | 'outdoor'
const activePanel = ref('my')       // 'my' | 'top'
const searched = ref(false) // user has searched for 
const searchQuery = ref('')
const searchLoading = ref(false)

/* =============== DERIVED =============== */
const matchesSorted = computed(() =>
  [...matches.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

// Right pane selection: find in either list, by shared id
const selectedMatch = computed(() => {
  const id = selectedMatchId.value
  return matches.value.find(m => m.id === id) || topPlayers.value.find(m => m.id === id) || null
})

const currentList = computed(() => (activePanel.value === 'top' ? topPlayers.value : matches.value))
const listTitle = computed(() => (currentList.value.length === 1 ? 'Match' : 'Matches'))
const activeFilterLabel = computed(() => FILTERS[activeFilter.value] || 'Outdoor')

/* =============== LIFECYCLE =============== */
onMounted(async () => {
  await applyFilter(activeFilter.value)
})

/* =============== ACTIONS =============== */
async function applyFilter (categoryKey) {
  activeFilter.value = categoryKey
  resetSearch()
  await loadLists(categoryKey)
}

function selectMatch(m) {
  selectedMatchId.value = m.id
}
function selectTopPlayer(m) {
  selectedMatchId.value = m.id
}

function onTitleToggle(target) {
  console.log('title toggle:', target, 'before=', activePanel.value)
  // emulate your “clicking open one opens the other” rule
  if (activePanel.value === target) {
    activePanel.value = target === 'my' ? 'top' : 'my'
  } else {
    activePanel.value = target
  }
  console.log('after=', activePanel.value)
}

async function runSearch () {
  const q = (searchQuery.value || '').trim()
  if (!q) return
  try {
    searchLoading.value = true

    // choose active category metadata
    const catLabel = FILTERS[activeFilter.value]
    const meta = metaData[catLabel]
    const k = Math.floor(Math.random() * 10) // pick one of the 10 meta slots

    const now = new Date().toISOString()
    const result = mkMatch({
      storeName: toTitle(q),
      category: catLabel,
      notes: meta.notes[k],
      successScore: meta.successScores[k],
      matchScore: meta.matchScores[k],
      address: meta.addresses[k],
      website: meta.websites[k],
      phone: '',
      buyerContact: '',
      radarPoints: genRadarDeterministic(`${catLabel}|${q}`),
      createdAt: now,
    })
    // mark as search item so we can cleanly remove it on Clear
    result.__search = true

    // push to top of matches and switch UI
    matches.value = [result]
    selectedMatchId.value = result.id
    activePanel.value = 'my'
    searched.value = true
  } finally {
    searchLoading.value = false
  }
}

// Clear search: hide search mode and remove any mocked search items we added
function resetSearch () {
  searched.value = false
  searchQuery.value = ''
  matches.value = matches.value.filter(m => !m.__search)
}

// tiny helper to title-case the search text
function toTitle (s) {
  return s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

/* =============== LOADERS (build both lists from names + metadata) =============== */
async function loadLists(segmentKey = 'outdoor') {
  const cat = FILTERS[segmentKey]
  const names = allStores[cat]
  matches.value = buildList(cat, names.matches)
  topPlayers.value = buildList(cat, names.topPlayers)

  // Auto-select newest item among the currently open panel
  const source = activePanel.value === 'top' ? topPlayers.value : matches.value
  selectedMatchId.value = source.length ? source[0].id : null
}

/* =============== BUILDERS + HELPERS =============== */
function buildList(categoryLabel, nameList) {
  const meta = metaData[categoryLabel]
  if (!meta) return []

  // pick 5 distinct indices from 0..9 to attach metadata to the 5 names
  const idxs = pickDistinctIndices(10, nameList.length)

  const now = Date.now()
  return nameList.map((storeName, i) => {
    const k = idxs[i]
    return mkMatch({
      storeName,
      category: categoryLabel,
      notes: meta.notes[k],
      successScore: meta.successScores[k],
      matchScore: meta.matchScores[k],
      address: meta.addresses[k],
      website: meta.websites[k],
      // you can add phone/buyerContact arrays later; default to empty now
      phone: '',
      buyerContact: '',
      radarPoints: genRadarDeterministic(`${categoryLabel}|${storeName}`),
      createdAt: new Date(now - i * 15 * 60 * 1000).toISOString(), // stagger times
    })
  })
}

function pickDistinctIndices(poolSize, n) {
  const arr = Array.from({ length: poolSize }, (_, i) => i)
  // Fisher–Yates shuffle (partial)
  for (let i = poolSize - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}

function genRadarDeterministic(seedStr) {
  // stable 6-dim radar per store/category
  const seed = hash(seedStr)
  const out = []
  let x = seed
  for (let i = 0; i < 6; i++) {
    x = (x * 1664525 + 1013904223) >>> 0
    out.push(55 + (x % 40)) // 55–94
  }
  return out
}

function hash(s) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mkMatch({
  storeName,
  category,
  notes,
  matchScore,
  successScore,
  address,
  website,
  phone = '',
  buyerContact = '',
  radarPoints,
  createdAt,
}) {
  const place = encodeURIComponent(`${storeName} store`)
  return {
    id: `m_${Math.random().toString(36).slice(2)}`,
    storeName,
    createdAt,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place}`,
    category,
    notes,
    matchScore,
    successScore,
    address,
    phone,
    website,
    buyerContact,
    radarPoints,
  }
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString()
}


</script>




<style scoped>
.filters-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.sidebar-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
  position: sticky;
  top: 12px; /* keeps it visible while scrolling */
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
.mb-2 { margin-bottom: 8px; }
</style>
