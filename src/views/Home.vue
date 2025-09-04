<template>
  <!-- Page Container -->
  <div class="px-0 py-0 d-flex flex-column brandora">
    <!-- Optional top notice / ribbon -->
    <div class="center"></div>

    <!-- Hero / Header Section -->
    <div class="hero-header">
      <h1 class="display-1 font-weight-bold mb-3 mt-10 white--text">
        Welcome to Brandora
      </h1>
      <p class="subtitle-1 mt-2 white--text">
        Retail matchmaking built around brand DNA.
      </p>
      <div class="mt-6 d-flex ga-3 justify-center">
        <<v-btn variant="flat" class="cta-btn" color="brand-primary" :to="{ name: 'Login' }">
          Get Started
        </v-btn>
        <v-btn variant="outlined" class="cta-outline" color="brand-success" @click="seeVideo()">See How It Works</v-btn>
      </div>
    </div>

    <!-- Main Content -->
    <v-row justify="center" class="mt-n8">
      <v-col cols="12" md="10" lg="9" class="content-bottom">

        <!-- Brandora at a Glance -->
        <v-card elevation="6" class="mb-6 glass">
          <v-card-title class="white--text">Brandora at a Glance</v-card-title>
          <v-card-text class="white--text px-8">
            <p>
              Brandora helps brands grow by building a strategic retailer roster aligned to your goals,
              values, and market presence. We replace guesswork with data-driven insights—so you partner
              with retailers that truly fit.
            </p>
            <ul class="white--text">
              <li><strong>Strategic Retailer Recommendations:</strong> Find the right retail partners based on your brand’s DNA and objectives.</li>
              <li><strong>Data-Driven Playbooks:</strong> Objective insights replace relationship-only approaches and misaligned incentives.</li>
              <li><strong>Smarter, Faster Growth:</strong> Reduce risk and accelerate wholesale expansion with clear, aligned matches.</li>
            </ul>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useOverlayStore } from '@/store/overlay'

const overlayStore = useOverlayStore()

function seeVideo() {
  overlayStore.openOverlay({
    title: 'A word from our developer overlord',
    text: '',
    mediaType: 'video',
    src: '/filler.mp4'
  })
}
</script>

<style scoped>
/* Page Container to allow for a gradient hero header */
.center{
display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-bottom: 40px;
}
.display-1 {
  text-align: center;
  padding: 10px;
}

/* Subtitle style tweak */
.subtitle-1 {
  text-align: center;
  letter-spacing: 0.5px;
  max-width: 600px;
  margin: 0;
}

.content-bottom {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Services card slight style changes */
.services-card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
  margin-top:20px
}

/* Tweak the look of bullet points */
.services-card ul {
  list-style: disc;
}

/* Button hover effect (just an example) */
.v-btn:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}

/* Minor text shadow for that “pop” */
.hero-header h1 {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}
.video {
  width: 640px;
  height: 372px;
}

@media (max-width: 700px) {
  .content-bottom {
    margin-top: 80px;
  }
  .hero-header {
    height: 30vh;
  }

  .video {
  width: 350px;
  height: 203px;
}
}
</style>
