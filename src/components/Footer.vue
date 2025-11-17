<template>
  <v-footer color="translucent">
    <div class="footer-text px-4">
      {{ new Date().getFullYear() }} — <strong>MOZAIQ</strong>
    </div>
  </v-footer>
</template>

<style scoped>
.v-footer {
  max-height: 60px;
  background-color: rgba(255, 255, 255, 0.5) !important;
  padding: 0px 16px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
}

.v-dialog {
  max-width: 40%;
  max-height: 70%;
}

.footer-text {
  line-height: 1.1 !important; /* Ensure proper vertical spacing */
  white-space: normal; /* Allow text to wrap */
  display: block; /* Ensure block-level display */
  padding: 10px; /* Add some padding if necessary */
}

@media only screen and (max-width: 1275px) {
  .v-dialog {
    max-width: 100%;
    max-height: 90%;
  }
}


@media only screen and (max-width: 700px) {
  .v-footer {
    display: flex;
    flex-direction: column;
    max-height: 150px;
    padding-bottom: 10px;
  }
}
</style>
