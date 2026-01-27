<template>
  <v-container fluid>
    
    <div class="top_line_dash">
      <div>
        <div class="text-h4 mb-2 dashboard-title">
          {{ user.name }}
        </div>
      </div>
      <v-spacer></v-spacer>
    </div>

    
    <v-tabs :model-value="currentTab" background-color="primary" class="white--text">
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

    
    <div class="mt-4">
      <router-view />
    </div>
  </v-container>
</template>


<!-- <template>
  <v-container fluid>
    <h1>Dashboard Works!</h1>
    <p>Current route: {{ $route.path }}</p>
    <router-view />
  </v-container>
</template> -->


<script setup>
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

console.log('🚀 Dashboard component loaded')

const route = useRoute()
console.log('📍 Current route:', route.path)

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

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
</script>

<!-- <script setup>
import { useRoute } from 'vue-router';
const route = useRoute()
console.log('Dashboard loaded, route:', route.path)
</script> -->

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

@media (max-width: 700px) {
  .dashboard-title {
    text-align: center;
  }
  
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