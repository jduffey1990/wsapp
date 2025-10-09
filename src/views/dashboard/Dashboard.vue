<template>
  <v-container fluid>

    <!-- Top section with user dashboard header -->
    <div class="top_line_dash">
      <div>
        <!-- User dashboard title displaying either full name or email -->
        <div class="text-h4 mb-2 dashboard-title">
          A Super Cool Person's Dashboard
        </div>
      </div>
      <v-spacer></v-spacer>
    </div>

    <!-- Tabs for switching between brackets and news -->
    <v-tabs v-model="currentTab" background-color="primary" class="white--text">
      <v-tab>
        Dashboard
      </v-tab>
      <v-tab>
        Matches
      </v-tab>
      <v-tab>
        Products
      </v-tab>
      <v-tab>
        Team
      </v-tab>
      <v-tab>
        Strategy
      </v-tab>
    </v-tabs>

    <!-- Content of the selected tab -->
    <v-tabs-window v-model="currentTab" class="mt-4">
      <!-- My Brackets tab content -->
       <!-- Product Tab -->
      <v-tabs-window-item class="window-item">
          <MatchesPanel />
      </v-tabs-window-item>
       <!-- Product Tab -->
      <v-tabs-window-item class="window-item">
          <MatchesPanel />
      </v-tabs-window-item>
       <!-- Brand Tab -->
      <v-tabs-window-item>
          <BrandPanel />
      </v-tabs-window-item>
      
      <v-tabs-window-item>
          <TeamPanel />
      </v-tabs-window-item>
      <v-tabs-window-item>
          <TeamPanel />
      </v-tabs-window-item>

    </v-tabs-window>
  </v-container>
</template>

<script setup>
/* Imports */
import MatchesPanel from './matches/Matches.vue'
import BrandPanel from './brand/BrandPanel.vue'
import TeamPanel from './team/TeamPanel.vue'
import { ref, onMounted, watch, inject } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import moment from 'moment'
const router = useRouter()

/* Inject your bracket & toast APIs if desired */
const { show } = inject('toast')
const $users = inject('$usersApi')

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)


/* Local state */
const currentTab = ref(0)
const products = ref([])

/* Lifecycle hooks */
// onMounted(async () => {
//   await fetchUserProductsDuped()
// })

const goToProduct = (item) => {
  router.push({
        name: 'Product',
        query: {
          id: item.id,
          // editable: item.editable
        }
      });
}

const checkBracketYear = (item) => {
  let bracketYearStr = item.createdAt.slice(0,4)
  return bracketFinalYears[bracketYearStr] !== undefined
}

</script>

<style scoped>
.card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
}

/* Example custom style for the dashboard title */
.dashboard-title {
  font-weight: 600;
  text-align: start;
}

/* Just to show you can style the bracket build button separately */
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
