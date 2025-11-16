<template>
  <div>
    <v-card-text>
      <Transition name="fade-transition" mode="out-in">
        <BrandAccountCreate
          @cancel="$emit('cancel')"
          @created="onCreated"
          @joined="onJoined"
        />
      </Transition>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {storeToRefs} from 'pinia';
import BrandAccountCreate from './BrandAccountCreate.vue'
import RetailAccountCreate from './RetailAccountCreate.vue'
import {useUserStore} from '@/store/user';

const userStore = useUserStore();
const {isBrand} = storeToRefs(userStore);

const emit = defineEmits(['created', 'cancel', 'joined'])

function onCreated() {
  emit('created')
}

function onJoined() {
  emit('joined')
}
</script>


<style scoped>
.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-card {
  min-width: 600px;
}

.title-holder {
  display: flex;
  justify-content: space-between;
}


.match-field {
  margin-top: 20px; /* Adds space above the div */
  padding: 10px; /* Adds padding inside the div */
  background-color: #f8f9fa; /* Light grey background for better contrast */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack child elements vertically */
  gap: 10px; /* Space between each span */
}

.match-field span {
  display: flex; /* Enables flexbox layout within each span */
  align-items: center; /* Centers items vertically within each span */
  gap: 8px; /* Space between icon and text */
}

.green-span, .red-span {
  color: inherit; /* Ensures text color matches dynamic class */
  font-family: "halyard-text" !important;
  font-size: 14px; /* Slightly larger text for better readability */
  font-style: normal;
  font-weight: 400; /* Normal font weight */
  line-height: 1.4; /* Adjust line height for better readability */
}

.v-icon {
  font-size: 20px; /* Size of the icon */
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: grey;
  font-family: "halyard-text" !important;
  font-size: 30px;
  cursor: pointer;
  z-index: 100; /* Ensure button stays on top of other content */

}


@media (max-width: 700px) {
  .title-holder {
    max-height: 64px !important;

  }

  .title {
    margin-bottom: 80px;
  }
  .main-card {
  min-width: 90%;
}
}

</style>