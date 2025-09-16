<template>
  <v-container class="py-10 home-wrap" fluid>
    <!-- Heading -->
    <div class="text-center mb-8">
      <h1 class="display-1 font-weight-bold white--text">Welcome to Brandora</h1>
      <p class="subtitle-1 mt-2 white--text">Select how we will do business together</p>
    </div>

    <!-- Choice Cards -->
    <v-row class="justify-center" align="stretch">
      <!-- Brand card -->
      <v-col cols="12" md="5">
        <v-card class="choice-card glass" elevation="8">
          <v-card-title class="text-h5 white--text">
            I am a brand seeking wholesale matches
          </v-card-title>
          <v-card-text class="white--text">
            Find retailers perfectly aligned with your category, price point, audience, and values.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="brand-primary"
              variant="flat"
              :to="{ name: 'BrandMatch' }"
              @click='labelUser("brand")'
            >
              Continue as Brand
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Retailer card -->
      <v-col cols="12" md="5">
        <v-card class="choice-card glass" elevation="8">
          <v-card-title class="text-h5 white--text">
            I am a retailer seeking brand matches
          </v-card-title>
          <v-card-text class="white--text">
            Discover high-fit brands that complement your assortment and resonate with your customers.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="brand-success"
              variant="outlined"
              :to="{ name: 'RetailerMatch' }"
              @click='labelUser("retail")'
            >
              Continue as Retailer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { inject } from 'vue'
import { storeToRefs } from 'pinia'

const { show } = inject('toast') ?? { show: undefined }
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const labelUser = (userType) => {
  userStore.setBusinessType(userType)
}
</script>

<style scoped>
.home-wrap {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.choice-card {
  border-radius: 16px;
  transition: transform .18s ease, box-shadow .18s ease;
}

.choice-card:hover {
  transform: translateY(-2px);
}

.glass {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
}

/* tighten spacing on small screens */
@media (max-width: 700px) {
  .home-wrap { padding-top: 32px !important; }
}
</style>
