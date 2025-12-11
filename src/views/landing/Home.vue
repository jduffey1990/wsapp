<template>
  <div class="split-bg">
    <!-- Background halves -->
    <div
      class="bg-half left"
      :class="{ 'is-active': hovered === 'brand' }"
      @mouseenter="hovered = 'brand'"
      @mouseleave="hovered = null"
      style="--bg-url: url('https://brandora-jduffey.s3.us-east-2.amazonaws.com/brand.png')"
    ></div>

    <!-- <div
      class="bg-half right"
      :class="{ 'is-active': hovered === 'retail' }"
      @mouseenter="hovered = 'retail'"
      @mouseleave="hovered = null"
      style="--bg-url: url('https://brandora-jduffey.s3.us-east-2.amazonaws.com/retail.png')"
    ></div> -->

    <!-- Foreground content -->
    <v-container class="py-10 home-wrap" fluid>
      <!-- Heading -->
      <div class="text-center mb-8">
        <v-img
          src="https://brandora-jduffey.s3.us-east-2.amazonaws.com/mozaiq.png"
          alt=""
          class="logo"
        />
      </div>

      <!-- Choice Buttons -->
      <v-row class="buttons">
        <v-col
          class="button"
          @mouseenter="hovered = 'brand'"
          @mouseleave="hovered = null"
        >
          <v-btn
            color="brand-primary"
            variant="flat"
            :to="{ name: 'Login'}"
            @click="labelUser('brand')"
            class="cta"
          >
            Continue as Brand
          </v-btn>
        </v-col>

        <!-- <v-col
          class="button ml-2"
          @mouseenter="hovered = 'retail'"
          @mouseleave="hovered = null"
        >
          <v-btn
            color="brand-primary"
            variant="flat"
            :to="{ name: 'Match', params: { aud: 'retailer' } }"
            @click="labelUser('retail')"
            class="cta"
          >
            Continue as Retailer
          </v-btn>
        </v-col> -->
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { inject, ref } from 'vue'

const { show } = inject('toast') ?? { show: undefined }
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const hovered = ref(null)

const labelUser = (userType) => {
  userStore.setBusinessType(userType)
}
</script>

<style scoped>
/* ====== Layout wrapper with split background ====== */
.split-bg {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.bg-half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-image:
    linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
    var(--bg-url);
  background-size: cover;
  background-position: center;
  filter: grayscale(25%) brightness(0.82);
  transition: filter .2s ease, box-shadow .2s ease;
  will-change: filter;
  /* allow hovering the background even with centered content */
  pointer-events: auto;
}

.bg-half.left  { left: 0; }
.bg-half.right { right: 0; }

/* Hover/active highlight: subtle lift & whitening */
.bg-half:hover,
.bg-half.is-active {
  filter: grayscale(0%) brightness(0.96);
  box-shadow: inset 0 0 120px rgba(255,255,255,0.25);
}

/* ====== Foreground content ====== */
.home-wrap {
  position: relative;
  z-index: 2;            /* above background halves */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: transparent;
}

.logo {
  padding-top: 65px;
  max-width: 350px;
  margin: 0 auto 16px;
}

.buttons {
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.button {
  display: flex;
  justify-content: center;
  gap: 16px; /* Vuetify 3 alternative: class="ga-4" */
}

.cta { min-width: 220px; }

/* Optional: card-like hover for buttons themselves */
.cta:hover {
  filter: brightness(1.05);
}

/* ====== Responsive: stack halves vertically on small screens ====== */
@media (max-width: 700px) {
  .bg-half {
    width: 100%;
    height: 50%;
  }
  .bg-half.left  { top: 0; left: 0; right: 0; }
  .bg-half.right { bottom: 0; left: 0; right: 0; }

  .home-wrap { padding-top: 32px !important; }
}
</style>
