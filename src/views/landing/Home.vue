<template>
  <v-container class="py-10 home-wrap" fluid>
    <!-- Heading -->
    <div class="text-center mb-8">
      <h1 class="display-1 font-weight-bold white--text">Welcome to Brandora</h1>
      <v-img
          src="https://brandora-jduffey.s3.us-east-2.amazonaws.com/brandora.png"
          alt=""
          class="logo">
        </v-img>
    </div>

    <!-- Choice Buttons -->
    <v-row class="buttons" no-gutters>
      <v-col cols="auto" class="button mr-2">
        <v-btn
          color="brand-primary"
          variant="flat"
          :to="{ name: 'Match', params: { aud: 'brand' } }"
          @click='labelUser("brand")'
          class="cta"
        >Continue as Brand</v-btn>
      </v-col>

      <v-col cols="auto" class="button ml-2">
        <v-btn
          color="brand-success"
          variant="outlined"
          :to="{ name: 'Match', params: { aud: 'retailer' } }"
          @click='labelUser("retail")'
          class="cta"
        >Continue as Retailer</v-btn>
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

.logo {
  padding-top: 65px;
  max-width: 350px;
  margin: 0 auto 16px;
}

.buttons {
  display: flex;
  align-items: start;
  justify-content: center;
}

.button {
  display: flex;
  justify-content: center;
  gap: 16px;            /* space between buttons (Vuetify 3 also supports class="ga-4") */
}

.cta { min-width: 220px; } 

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
