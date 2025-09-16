<template>
  <!-- Page Container -->
  <div class="px-0 py-0 d-flex flex-column brandora">
    <div class="center"></div>

    <!-- Hero / Header Section -->
    <div class="hero-header">
      <h1 class="display-1 font-weight-bold mb-3 mt-10 white--text">
        Welcome, Retailers
      </h1>
      <p class="subtitle-1 mt-2 white--text">
        We use retailer + brand data to match you with perfectly aligned brands.
      </p>
      <div class="mt-6 d-flex ga-3 justify-center">
        <v-btn variant="flat" class="cta-btn" color="brand-primary" @click="setRetailer">
          Get Started
        </v-btn>
        <v-btn variant="outlined" class="cta-outline" color="brand-success" @click="seeVideo()">See How It Works</v-btn>
      </div>
    </div>

    <!-- Main Content -->
    <v-row justify="center" class="mt-n8">
      <v-col cols="12" md="10" lg="9" class="content-bottom">
        <v-card elevation="6" class="mb-6 glass">
          <v-card-title class="white--text">Brandora at a Glance</v-card-title>
          <v-card-text class="white--text px-8">
            <p>
              Brandora helps retailers discover high-fit brands by aligning assortment strategy, values,
              and market positioning. We replace guesswork with data—so you onboard brands that truly fit.
            </p>
            <ul class="white--text">
              <li><strong>Perfect-Match Brands:</strong> Get curated brand recommendations that fit your category strategy and customer profile.</li>
              <li><strong>Data-Driven Fit Scores:</strong> We analyze brand DNA, performance signals, and values alignment to remove bias and guesswork.</li>
              <li><strong>Faster Category Growth:</strong> Reduce scouting time and expand with brands that complement your shelves.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useOverlayStore } from '@/store/overlay'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const overlayStore = useOverlayStore()

// Get the store instance for actions, and refs for reactive state
const userStore = useUserStore()
const { user } = storeToRefs(userStore)   // state as refs
const router = useRouter()

function setRetailer () {
  userStore.setBusinessType('retail')     // call the action
  router.push('/login')
}

function seeVideo () {
  overlayStore.openOverlay({
    title: 'How Brandora matches retailers with the right brands',
    text: '',
    mediaType: 'video',
    src: '/filler.mp4',
  })
}
</script>


<style scoped>
.center{ display:flex; flex-direction:column; justify-content:center; align-items:center; }
.hero-header{ display:flex; flex-direction:column; justify-content:center; align-items:center; padding:10px; margin-bottom:40px; }
.display-1{ text-align:center; padding:10px; }
.subtitle-1{ text-align:center; letter-spacing:.5px; max-width:600px; margin:0; }
.content-bottom{ display:flex; flex-direction:column; justify-content:center; align-items:center; }
.services-card{ border-radius:12px; background-color:rgba(255,255,255,0.2); margin-top:20px; }
.services-card ul{ list-style:disc; }
.v-btn:hover{ transform:scale(1.02); transition:transform .2s ease-in-out; }
.hero-header h1{ text-shadow:2px 2px 8px rgba(0,0,0,.3); }
.video{ width:640px; height:372px; }
@media (max-width:700px){
  .content-bottom{ margin-top:80px; }
  .hero-header{ height:30vh; }
  .video{ width:350px; height:203px; }
}
</style>
