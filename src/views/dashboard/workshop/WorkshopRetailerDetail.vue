<!-- src/views/dashboard/workshop/WorkshopRetailerDetail.vue -->
<template>
  <v-container fluid class="retailer-detail-page pa-0">
    <!-- Loading State -->
    <div v-if="!workshopRetailer" class="pa-8 text-center">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 mt-4">Loading retailer...</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <div class="header-bar pa-4">
        <v-row align="center" dense>
          <v-col cols="12" md="auto">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="handleBack"
            />
          </v-col>

          <v-col cols="12" md="auto" class="flex-grow-1">
            <div class="d-flex align-center">
              <v-avatar size="56" color="primary" class="mr-3">
                {{ retailer.businessName?.charAt(0) || '?' }}
              </v-avatar>
              <div>
                <h1 class="text-h5 font-weight-bold mb-1">{{ retailer.businessName }}</h1>
                <p class="text-body-2 text-medium-emphasis ma-0">
                  <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                  {{ formatLocation(retailer) }}
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="auto">
            <div class="d-flex ga-2">
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete"
                @click="handleRemove"
              >
                Remove from Workshop
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Content Grid -->
      <div class="content-grid pa-4">
        <!-- LEFT COLUMN: Details & Info -->
        <div class="left-column">
          <!-- Status Card -->
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-flag</v-icon>
              Relationship Status
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="workshopRetailer.status"
                :items="statusOptions"
                label="Current Status"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="handleStatusChange"
              >
                <template #selection="{ item }">
                  <v-chip
                    :color="getStatusColor(item.value)"
                    variant="flat"
                  >
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>

              <v-divider class="my-4" />

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Added By</div>
                  <div class="info-value">{{ workshopRetailer.addedByName }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">Added On</div>
                  <div class="info-value">{{ formatDate(workshopRetailer.addedDate) }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">Last Contact</div>
                  <div class="info-value">
                    {{ workshopRetailer.lastContactDate 
                      ? formatDate(workshopRetailer.lastContactDate) 
                      : 'Never' }}
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">Assigned To</div>
                  <div class="info-value">{{ workshopRetailer.assignedToName }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Retailer Info Card -->
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-information</v-icon>
              Retailer Information
            </v-card-title>
            <v-card-text>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Type</div>
                  <div class="info-value">{{ retailer.retailerType || 'N/A' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">Price Point</div>
                  <div class="info-value">{{ retailer.pricePointCategory || 'N/A' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">Locations</div>
                  <div class="info-value">{{ retailer.numLocations || 'N/A' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">Annual Revenue</div>
                  <div class="info-value">
                    {{ retailer.estAnnualRevenue 
                      ? `$${(retailer.estAnnualRevenue / 1000000).toFixed(1)}M` 
                      : 'N/A' }}
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">Avg Order Size</div>
                  <div class="info-value">
                    {{ retailer.avgOpeningOrderSize 
                      ? `$${(retailer.avgOpeningOrderSize / 1000).toFixed(0)}k` 
                      : 'N/A' }}
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">Rating</div>
                  <div class="info-value">
                    {{ retailer.customerReviewRating 
                      ? `${retailer.customerReviewRating}★` 
                      : 'N/A' }}
                  </div>
                </div>
              </div>

              <!-- Categories -->
              <v-divider class="my-4" />
              <div v-if="retailer.carriedCategories?.length > 0">
                <div class="info-label mb-2">Categories</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="category in retailer.carriedCategories"
                    :key="category"
                    size="small"
                    variant="outlined"
                  >
                    {{ category }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions Card -->
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
              Quick Actions
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-column gap-2">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-phone"
                  block
                  @click="showLogCallDialog = true"
                >
                  Log Call
                </v-btn>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-email"
                  block
                  @click="showLogEmailDialog = true"
                >
                  Log Email
                </v-btn>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-calendar"
                  block
                  @click="showLogMeetingDialog = true"
                >
                  Log Meeting
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- RIGHT COLUMN: Notes & Activity -->
        <div class="right-column">
          <!-- Notes Section -->
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <v-icon class="mr-2">mdi-note-text</v-icon>
                Notes
              </div>
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="showAddNoteDialog = true"
              >
                Add Note
              </v-btn>
            </v-card-title>
            <v-card-text>
              <!-- Notes List -->
              <div v-if="workshopRetailer.notes.length > 0" class="notes-list">
                <v-card
                  v-for="note in workshopRetailer.notes"
                  :key="note.id"
                  class="mb-3"
                  variant="tonal"
                >
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div class="text-caption text-medium-emphasis">
                        {{ note.user }} · {{ formatDate(note.date) }}
                      </div>
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        size="x-small"
                        color="error"
                        @click="handleDeleteNote(note.id)"
                      />
                    </div>
                    <div class="text-body-2">{{ note.content }}</div>
                  </v-card-text>
                </v-card>
              </div>
              <div v-else class="text-center text-medium-emphasis py-4">
                No notes yet
              </div>
            </v-card-text>
          </v-card>

          <!-- Activity Timeline -->
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-timeline</v-icon>
              Activity Timeline
            </v-card-title>
            <v-card-text>
              <v-timeline side="end" density="compact" class="activity-timeline">
                <v-timeline-item
                  v-for="activity in sortedActivities"
                  :key="activity.id"
                  :dot-color="getActivityColor(activity.type)"
                  size="small"
                >
                  <template #icon>
                    <v-icon size="16" color="white">{{ getActivityIcon(activity.type) }}</v-icon>
                  </template>

                  <div class="activity-item">
                    <div class="activity-header">
                      <span class="font-weight-medium">{{ activity.user }}</span>
                      <span class="text-caption text-medium-emphasis ml-2">
                        {{ formatDate(activity.date) }}
                      </span>
                    </div>
                    <div class="text-body-2 mt-1">{{ activity.content }}</div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>

    <!-- Add Note Dialog -->
    <v-dialog v-model="showAddNoteDialog" max-width="600">
      <v-card>
        <v-card-title>Add Note</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newNote"
            label="Note"
            rows="4"
            variant="outlined"
            placeholder="Add your notes about this retailer..."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddNoteDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!newNote.trim()"
            @click="handleAddNote"
          >
            Add Note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Log Call Dialog -->
    <v-dialog v-model="showLogCallDialog" max-width="600">
      <v-card>
        <v-card-title>Log Call</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="callNotes"
            label="Call Notes"
            rows="4"
            variant="outlined"
            placeholder="What was discussed during the call?"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLogCallDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!callNotes.trim()"
            @click="handleLogCall"
          >
            Log Call
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Log Email Dialog -->
    <v-dialog v-model="showLogEmailDialog" max-width="600">
      <v-card>
        <v-card-title>Log Email</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="emailSubject"
            label="Email Subject"
            variant="outlined"
            placeholder="What was the email about?"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLogEmailDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!emailSubject.trim()"
            @click="handleLogEmail"
          >
            Log Email
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Log Meeting Dialog -->
    <v-dialog v-model="showLogMeetingDialog" max-width="600">
      <v-card>
        <v-card-title>Log Meeting</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="meetingNotes"
            label="Meeting Notes"
            rows="4"
            variant="outlined"
            placeholder="What happened in the meeting?"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLogMeetingDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!meetingNotes.trim()"
            @click="handleLogMeeting"
          >
            Log Meeting
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { useWorkshopStore } from '@/store/workshop';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const workshopStore = useWorkshopStore();
const { user } = storeToRefs(useUserStore());
const toast = inject('toast');

// State
const showAddNoteDialog = ref(false);
const showLogCallDialog = ref(false);
const showLogEmailDialog = ref(false);
const showLogMeetingDialog = ref(false);
const newNote = ref('');
const callNotes = ref('');
const emailSubject = ref('');
const meetingNotes = ref('');

const statusOptions = [
  { title: 'Research', value: 'research' },
  { title: 'Initial Contact', value: 'initial_contact' },
  { title: 'In Discussion', value: 'in_discussion' },
  { title: 'Negotiating', value: 'negotiating' },
  { title: 'Deal Closed', value: 'deal_closed' },
  { title: 'Passed', value: 'passed' }
];

// Computed
const retailerId = computed(() => route.params.retailerId);

const workshopRetailer = computed(() => 
  workshopStore.getWorkshopRetailer(retailerId.value)
);

const retailer = computed(() => workshopRetailer.value?.retailer);

const sortedActivities = computed(() => {
  if (!workshopRetailer.value) return [];
  return [...workshopRetailer.value.activities].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
});

// Methods
const formatLocation = (retailer) => {
  const parts = [];
  if (retailer.city) parts.push(retailer.city);
  if (retailer.state) parts.push(retailer.state);
  return parts.join(', ') || 'Location Unknown';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

const getActivityColor = (type) => {
  const colors = {
    added: 'primary',
    status_change: 'info',
    note: 'warning',
    call: 'success',
    email: 'secondary',
    meeting: 'purple'
  };
  return colors[type] || 'grey';
};

const getActivityIcon = (type) => {
  const icons = {
    added: 'mdi-plus',
    status_change: 'mdi-flag',
    note: 'mdi-note',
    call: 'mdi-phone',
    email: 'mdi-email',
    meeting: 'mdi-calendar'
  };
  return icons[type] || 'mdi-circle';
};

const handleStatusChange = (newStatus) => {
  try {
    workshopStore.updateStatus(retailerId.value, newStatus, user.value);
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

const handleAddNote = () => {
  try {
    workshopStore.addNote(retailerId.value, newNote.value, user.value);
    toast?.show({
      message: 'Note added',
      error: false
    });
    newNote.value = '';
    showAddNoteDialog.value = false;
  } catch (error) {
    console.error('Error adding note:', error);
    toast?.show({
      message: 'Failed to add note',
      error: true
    });
  }
};

const handleDeleteNote = (noteId) => {
  if (confirm('Delete this note?')) {
    try {
      workshopStore.deleteNote(retailerId.value, noteId);
      toast?.show({
        message: 'Note deleted',
        error: false
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast?.show({
        message: 'Failed to delete note',
        error: true
      });
    }
  }
};

const handleLogCall = () => {
  try {
    workshopStore.logCall(retailerId.value, callNotes.value, user.value);
    toast?.show({
      message: 'Call logged',
      error: false
    });
    callNotes.value = '';
    showLogCallDialog.value = false;
  } catch (error) {
    console.error('Error logging call:', error);
    toast?.show({
      message: 'Failed to log call',
      error: true
    });
  }
};

const handleLogEmail = () => {
  try {
    workshopStore.logEmail(retailerId.value, emailSubject.value, user.value);
    toast?.show({
      message: 'Email logged',
      error: false
    });
    emailSubject.value = '';
    showLogEmailDialog.value = false;
  } catch (error) {
    console.error('Error logging email:', error);
    toast?.show({
      message: 'Failed to log email',
      error: true
    });
  }
};

const handleLogMeeting = () => {
  try {
    workshopStore.logMeeting(retailerId.value, meetingNotes.value, user.value);
    toast?.show({
      message: 'Meeting logged',
      error: false
    });
    meetingNotes.value = '';
    showLogMeetingDialog.value = false;
  } catch (error) {
    console.error('Error logging meeting:', error);
    toast?.show({
      message: 'Failed to log meeting',
      error: true
    });
  }
};

const handleRemove = () => {
  if (confirm(`Remove ${retailer.value.businessName} from workshop?`)) {
    try {
      workshopStore.removeFromWorkshop(retailerId.value);
      toast?.show({
        message: 'Retailer removed from workshop',
        error: false
      });
      router.push({ name: 'Workshop' });
    } catch (error) {
      console.error('Error removing retailer:', error);
      toast?.show({
        message: 'Failed to remove retailer',
        error: true
      });
    }
  }
};

const handleBack = () => {
  router.push({ name: 'Workshop' });
};

// Mount
onMounted(() => {
  workshopStore.setCurrentRetailer(retailerId.value);
  
  if (!workshopRetailer.value) {
    toast?.show({
      message: 'Retailer not found in workshop',
      error: true
    });
    router.push({ name: 'Workshop' });
  }
});
</script>

<style scoped>
.retailer-detail-page {
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

.content-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 16px;
  align-items: start;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
}

/* Card styling to match BrandPanel */
.left-column :deep(.v-card),
.right-column :deep(.v-card) {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06);
}

.left-column :deep(.v-card-title),
.right-column :deep(.v-card-title) {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
  font-size: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.56);
  margin-bottom: 4px;
  font-weight: 600;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.notes-list {
  max-height: 400px;
  overflow-y: auto;
}

.notes-list :deep(.v-card) {
  border-radius: 12px;
  background: rgba(91, 146, 121, 0.08);
  border: 1px solid rgba(91, 146, 121, 0.15);
}

.activity-timeline {
  max-height: 600px;
  overflow-y: auto;
}

.activity-timeline :deep(.v-timeline-item) {
  padding-bottom: 4px;
}

.activity-item {
  padding-bottom: 8px;
}

.activity-header {
  display: flex;
  align-items: center;
}

/* Dividers */
:deep(.v-divider) {
  border-color: rgba(0,0,0,0.06) !important;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.ga-2 {
  gap: 8px;
}

/* Dialog styling */
:deep(.v-dialog .v-card) {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,0.08);
}

:deep(.v-dialog .v-card-title) {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-weight: 700;
}

/* Mobile responsive */
@media (max-width: 780px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Custom scrollbar */
.notes-list::-webkit-scrollbar,
.activity-timeline::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track,
.activity-timeline::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
}

.notes-list::-webkit-scrollbar-thumb,
.activity-timeline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>