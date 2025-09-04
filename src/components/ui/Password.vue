<template>
  <v-text-field
    :label="placeholder || 'Password'"
    :type="showPassword ? 'text' : 'password'"
    @click:append-inner="toggleShowPassword()"
    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
    v-model="model"
  ></v-text-field>
</template>

<script setup>
import { ref } from 'vue';

const model = defineModel();

defineProps({
  placeholder: String,
});

const showPassword = ref(false);
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>
