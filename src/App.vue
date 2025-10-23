<template>
  <v-app class="overall-app">
    <div class="header-div">
      <Header/>
    </div>
    <UiToast>
      <v-main class="padding-add">
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
    </UiToast>

    <!-- Conditionally render Overlay component based on store state -->
    <Overlay
      v-if="showOverlay"
      :title="overlayContent.title"
      :text="overlayContent.text"
      :mediaType="overlayContent.mediaType"
      :src="overlayContent.src"
      @close="overlayStore.closeOverlay"
    />

    <Footer/>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import UiToast from '@/components/ui/Toast.vue'
import Overlay from './components/Overlay.vue'
import { useRouter } from 'vue-router'

import {inject, ref} from 'vue';

const $axios = inject('$axios');
const $users = inject('$usersApi')
const $businessVerification = inject('$businessVerificationApi')

import { useUserStore } from '@/store/user'
import { useOverlayStore } from '@/store/overlay'
import { storeToRefs } from 'pinia'

const {user} = storeToRefs(useUserStore());
const overlayStore = useOverlayStore()
const { showOverlay, overlayContent } = storeToRefs(overlayStore)
const router = useRouter();

const screenWidth = window.innerWidth;


// Define the classes for the background
const appBackground = 'appBackground';
const whiteBackground = 'whiteBackground';

import {onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();


</script>

<style>
.overall-app {
  width: 100%;
  background: #5B9279 !important;
}
.header-div {
  height: 150px;
}  

.padding-add {
  padding-top: 10px !important;
}

.appBackground {
  background: linear-gradient(180deg, #E1EFFF 50%, #F9BBA9 90.05%) !important;
  min-height: 87vh;
  width: 100% !important;
}

.whiteBackground {
  background-color: white !important;
  min-height: 87vh;
  width: 100% !important;
}

.trans-background {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

@media only screen and (max-width: 700px) {
  .header-div{
    height:190px;
    transform: translateY(20px);
  }
}
</style>
