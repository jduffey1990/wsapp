<!-- src/views/dashboard/workshop/WorkshopPanel.vue -->
<template>
  <v-container fluid class="workshop-panel pa-0">
    <!-- Header -->
    <div class="header-bar pa-4">
      <v-row align="center" dense>
        <v-col cols="12" md="auto">
          <div>
            <h1 class="text-h5 font-weight-bold mb-1">Workshop</h1>
            <p class="text-body-2 text-medium-emphasis ma-0">
              Your target retailer pipeline
            </p>
          </div>
        </v-col>

        <v-spacer class="d-none d-md-flex" />

        <v-col cols="12" md="auto">
          <div class="d-flex ga-2 align-center flex-wrap">
            <!-- Status Filter -->
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 180px"
              @update:model-value="filterRetailers"
            />

            <!-- Sort -->
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 180px"
            />
          </div>
        </v-col>
      </v-row>

      <!-- Status Summary Chips -->
      <v-row dense class="mt-3">
        <v-col cols="auto">
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="(count, status) in statusCounts"
              :key="status"
              size="small"
              :color="getStatusColor(status)"
              variant="tonal"
            >
              {{ formatStatusLabel(status) }}: {{ count }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Main Content -->
    <div class="main-content pa-4">
      <!-- Empty State -->
      <v-card v-if="filteredRetailers.length === 0" class="pa-12 text-center empty-state" elevation="0">
        <v-icon size="80" color="grey-lighten-1">mdi-toolbox-outline</v-icon>
        <h3 class="text-h6 mt-4 mb-2">
          {{ allRetailers.length === 0 ? 'No retailers in workshop' : 'No retailers match filters' }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ allRetailers.length === 0 
            ? 'Add retailers from the discovery page to start building your pipeline' 
            : 'Try adjusting your filters' }}
        </p>
        <v-btn
          v-if="allRetailers.length === 0"
          color="primary"
          variant="outlined"
          to="/dashboard/retailers"
        >
          Browse Retailers
        </v-btn>
      </v-card>

      <!-- Retailers Table -->
      <v-card v-else elevation="0" class="retailers-table">
        <v-table>
          <thead>
            <tr>
              <th>Retailer</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Added On</th>
              <th>Last Contact</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="workshopRetailer in filteredRetailers"
              :key="workshopRetailer.id"
              class="retailer-row"
              @click="handleRowClick(workshopRetailer)"
            >
              <!-- Retailer Info -->
              <td>
                <div class="d-flex align-center">
                  <v-avatar size="40" color="primary" class="mr-3">
                    {{ workshopRetailer.retailer.businessName?.charAt(0) || '?' }}
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">
                      {{ workshopRetailer.retailer.businessName }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ workshopRetailer.retailer.numLocations || 0 }} locations
                    </div>
                  </div>
                </div>
              </td>

              <!-- Location -->
              <td>
                <div class="text-body-2">
                  {{ formatLocation(workshopRetailer.retailer) }}
                </div>
              </td>

              <!-- Type -->
              <td>
                <v-chip
                  v-if="workshopRetailer.retailer.retailerType"
                  size="small"
                  variant="tonal"
                >
                  {{ workshopRetailer.retailer.retailerType }}
                </v-chip>
              </td>

              <!-- Status -->
              <td>
                <v-select
                  :model-value="workshopRetailer.status"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="(val) => handleStatusChange(workshopRetailer.retailerId, val)"
                  @click.stop
                >
                  <template #selection="{ item }">
                    <v-chip
                      size="small"
                      :color="getStatusColor(item.value)"
                      variant="flat"
                    >
                      {{ item.title }}
                    </v-chip>
                  </template>
                </v-select>
              </td>

              <!-- Added By -->
              <td>
                <div class="text-body-2">
                  {{ workshopRetailer.addedByName }}
                </div>
              </td>

              <!-- Added On -->
              <td>
                <div class="text-body-2">
                  {{ formatDate(workshopRetailer.addedDate) }}
                </div>
              </td>

              <!-- Last Contact -->
              <td>
                <div class="text-body-2">
                  {{ workshopRetailer.lastContactDate 
                    ? formatDate(workshopRetailer.lastContactDate) 
                    : 'Never' }}
                </div>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="d-flex ga-1 justify-center" @click.stop>
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    size="small"
                    @click="handleRowClick(workshopRetailer)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="handleRemove(workshopRetailer)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useWorkshopStore } from '@/store/workshop';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const router = useRouter();
const workshopStore = useWorkshopStore();
const { user } = storeToRefs(useUserStore());
const toast = inject('toast');

// State
const statusFilter = ref('all');
const sortBy = ref('addedDate');

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Research', value: 'research' },
  { title: 'Initial Contact', value: 'initial_contact' },
  { title: 'In Discussion', value: 'in_discussion' },
  { title: 'Negotiating', value: 'negotiating' },
  { title: 'Deal Closed', value: 'deal_closed' },
  { title: 'Passed', value: 'passed' }
];

const sortOptions = [
  { title: 'Date Added (Newest)', value: 'addedDate' },
  { title: 'Date Added (Oldest)', value: 'addedDateAsc' },
  { title: 'Name (A-Z)', value: 'name' },
  { title: 'Last Contact', value: 'lastContact' },
  { title: 'Status', value: 'status' }
];

// Computed
const allRetailers = computed(() => workshopStore.allRetailers);

const statusCounts = computed(() => workshopStore.countByStatus);

const filteredRetailers = computed(() => {
  let result = [...allRetailers.value];

  // Filter by status
  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter(wr => wr.status === statusFilter.value);
  }

  // Sort
  switch (sortBy.value) {
    case 'addedDate':
      result.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
      break;
    case 'addedDateAsc':
      result.sort((a, b) => new Date(a.addedDate) - new Date(b.addedDate));
      break;
    case 'name':
      result.sort((a, b) => 
        a.retailer.businessName.localeCompare(b.retailer.businessName)
      );
      break;
    case 'lastContact':
      result.sort((a, b) => {
        if (!a.lastContactDate) return 1;
        if (!b.lastContactDate) return -1;
        return new Date(b.lastContactDate) - new Date(a.lastContactDate);
      });
      break;
    case 'status':
      result.sort((a, b) => a.status.localeCompare(b.status));
      break;
  }

  return result;
});

// Methods
const formatLocation = (retailer) => {
  const parts = [];
  if (retailer.city) parts.push(retailer.city);
  if (retailer.state) parts.push(retailer.state);
  return parts.join(', ') || 'N/A';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatStatusLabel = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusColor = (status) => {
  const colors = {
    research: 'grey',
    initial_contact: 'blue',
    in_discussion: 'orange',
    negotiating: 'purple',
    deal_closed: 'success',
    passed: 'error'
  };
  return colors[status] || 'grey';
};

const handleStatusChange = (retailerId, newStatus) => {
  try {
    workshopStore.updateStatus(retailerId, newStatus, user.value);
    toast?.show({
      message: 'Status updated',
      error: false
    });
  } catch (error) {
    console.error('Error updating status:', error);
    toast?.show({
      message: 'Failed to update status',
      error: true
    });
  }
};

const handleRowClick = (workshopRetailer) => {
  router.push({
    name: 'WorkshopRetailerDetail',
    params: { retailerId: workshopRetailer.retailerId }
  });
};

const handleRemove = (workshopRetailer) => {
  if (confirm(`Remove ${workshopRetailer.retailer.businessName} from workshop?`)) {
    try {
      workshopStore.removeFromWorkshop(workshopRetailer.retailerId);
      toast?.show({
        message: 'Retailer removed from workshop',
        error: false
      });
    } catch (error) {
      console.error('Error removing retailer:', error);
      toast?.show({
        message: 'Failed to remove retailer',
        error: true
      });
    }
  }
};

const filterRetailers = () => {
  // Triggers computed property recalculation
};

// Mount
onMounted(() => {
  // Data already in store from localStorage
});
</script>

<style scoped>
.workshop-panel {
  min-height: 100vh;
}

.header-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 9;
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
}

.empty-state {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.retailers-table {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
  overflow: hidden;
}

.retailers-table :deep(.v-table) {
  background: transparent;
}

.retailers-table :deep(thead) {
  background: rgba(91, 146, 121, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.retailers-table :deep(thead th) {
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.7);
  border-bottom: none !important;
}

.retailers-table :deep(tbody tr) {
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.retailer-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retailer-row:hover {
  background-color: rgba(91, 146, 121, 0.04) !important;
}

.ga-1 {
  gap: 4px;
}

.ga-2 {
  gap: 8px;
}

/* Chip styling to match BrandPanel */
:deep(.v-chip) {
  font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 780px) {
  .retailers-table :deep(.v-table) {
    font-size: 0.875rem;
  }

  .retailers-table :deep(.v-table th),
  .retailers-table :deep(.v-table td) {
    padding: 8px 4px;
  }
}
</style>