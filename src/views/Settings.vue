<template>
  <v-layout class="justify-center pa-4">
    <v-card class="main-card">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
              v-if="isEditing"
              color="primary"
              variant="elevated"
              @click="saveProfile()"
          >
            Save
          </v-btn>
          <v-btn
              v-if="isEditing"
              color="warning"
              variant="elevated"
              @click="cancelEdit"
          >
            Cancel Edit
          </v-btn>
          <v-btn
              v-else
              color="primary"
              variant="elevated"
              @click="startEditing"
          >
            Edit Settings
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <!-- Name and Email Fields -->
        <v-text-field
            v-model="account.firstName"
            label="First name"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
        <v-text-field
            v-model="account.lastName"
            label="Last name"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
        <v-text-field
            label="Email"
            type="email"
            v-model="account.email"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {reactive, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {inject} from 'vue';
import {parseError} from '@/utils/error';
import {storeToRefs} from "pinia";

// Inject dependencies
const $users = inject('$usersApi');
const {show} = inject('toast');

// Get user data
const {user} = storeToRefs(useUserStore())
const showClientModal = ref(false);
const advisors = ref([])
const selectedAdvisor = ref("")
const isSubmitting = ref(false);
const clientDemo = ref(true)
const clientRisk = ref(true)
const isEditing = ref(false)

// Reactive data for account and accountCopy
const account = ref({
  firstName: "Lori",
  lastName: "Lightfoot",
  email: "loggedinuser@gmail.com",
});

const accountCopy = ref({...account});

const getUser = async () => {
  try {
    let response = await $users.get(`/get-user?id=${user.value._id}`);
    let userReturned = response.data
      let arrayOfNames = userReturned.name.split(" ")
      account.value.firstName = arrayOfNames[0]
      account.value.lastName = arrayOfNames[1]
      account.value.email = userReturned.email

      accountCopy.value = {...account.value}
    }catch (error) {
    console.error(error)
  }
}

const startEditing = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  // Reset the account to the saved state
  Object.assign(account, accountCopy);
};

// Function to check if there are unsaved changes
const hasUnsavedChanges = () => {
  return JSON.stringify(account) !== JSON.stringify(accountCopy);
};

// Save profile function
const saveProfile = async () => {
  try {
    Object.assign(accountCopy, {...account}); // Update accountCopy after saving
    show({message: 'Account saved!'});
    isEditing.value=false
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};


// Warn the user if they have unsaved changes when leaving the page
const beforeUnloadHandler = (event) => {
  if (hasUnsavedChanges() && isEditing.value) {
    event.preventDefault();
    event.returnValue = ''; // Required to trigger the confirmation dialog
  }
};

const preventClickWhenReadOnly = (event) => {
  if (!isEditing.value) {
    event.preventDefault();
    event.stopPropagation();
  }
}



// Register the event listener on mounted and remove it on unmount
onMounted(async () => {
  await getUser()
  window.addEventListener('beforeunload', beforeUnloadHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler);
});

// need watch function here:
</script>

<style scoped>
.sub_header {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-bottom: 2px solid black;
  padding-bottom: 5px;
  width: fit-content;
}

.toggle {
  transform: translateY(-10px);
}

.main-card {
  width: 600px !important;
}

.client-move {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 700px) {
  .main-card {
    min-width: 95vw;
  }

  .title-holder {
    max-height: 64px !important;
  }

  .title-holder .v-btn {
    font-size: xx-small;
  }

  .title {
    margin-bottom: 80px;
    font-size: small;
  }
}

</style>

