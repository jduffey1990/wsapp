<template>
  <v-container fluid>
    <!-- Top section with user dashboard header -->
    <div class="top_line_dash">
      <div>
        <div class="text-h4 mb-2 dashboard-title">
          {{ user.name }}
        </div>
      </div>
      <v-spacer></v-spacer>
    </div>

    <!-- Desktop Tabs (hidden on mobile) -->
    <v-tabs 
      :model-value="currentTab" 
      background-color="primary" 
      class="white--text desktop-tabs"
    >
      <v-tab to="/dashboard/brand">
        Brand & Products
      </v-tab>
      <v-tab to="/dashboard/team">
        Team
      </v-tab>
      <v-tab to="/dashboard/retailers">
        Retailers
      </v-tab>
      <v-tab to="/dashboard/conversations">
        Conversations
      </v-tab>
      <v-tab to="/dashboard/recommendations">
        Recommendations
      </v-tab>
    </v-tabs>

    <!-- Mobile Dropdown (hidden on desktop) -->
    <v-select
      :model-value="currentRoute"
      :items="navigationItems"
      item-title="label"
      item-value="path"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-menu"
      class="mobile-nav mb-4"
      hide-details
      @update:model-value="navigateTo"
    />

    <!-- Content -->
    <div class="mt-4">
      <router-view />
    </div>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

/* Navigation items for dropdown */
const navigationItems = [
  { label: 'Brand & Products', path: '/dashboard/brand' },
  { label: 'Team', path: '/dashboard/team' },
  { label: 'Retailers', path: '/dashboard/retailers' },
  { label: 'Conversations', path: '/dashboard/conversations' },
  { label: 'Recommendations', path: '/dashboard/recommendations' }
]

/* Compute current tab based on route */
const currentTab = computed(() => {
  const path = route.path
  if (path.includes('/brand')) return 0
  if (path.includes('/team')) return 1
  if (path.includes('/retailers')) return 2
  if (path.includes('/conversations')) return 3
  if (path.includes('/recommendations')) return 4
  return 0
})

/* Current route for dropdown */
const currentRoute = computed(() => route.path)

/* Navigate to selected route */
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
}

.dashboard-title {
  font-weight: 600;
  text-align: start;
}

.build-bracket-btn {
  min-width: 200px;
  margin-left: 1rem;
}

.table-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 10px;
}

/* Custom responsive breakpoint at 780px */
@media (max-width: 779px) {
  .desktop-tabs {
    display: none !important;
  }
  .mobile-nav {
    display: flex !important;
  }
  
  .dashboard-title {
    text-align: center;
  }
}

@media (min-width: 780px) {
  .desktop-tabs {
    display: flex !important;
  }
  .mobile-nav {
    display: none !important;
  }
}

/* Additional mobile styles */
@media (max-width: 700px) {
  elevation-1 {
    font-size: x-small;
  }

  .elevation-1 .v-btn{
    font-size:7px;
    padding: 3px;
  }

  .build-bracket-btn{
    font-size: 7px;
    min-width: 0;
    width: 100px !important;
  }
}
</style>