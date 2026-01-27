<!-- src/views/dashboard/retailers/BeginConversationModal.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="700"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-avatar size="40" color="primary" class="mr-3">
          {{ retailer?.businessName?.charAt(0) || '?' }}
        </v-avatar>
        <div>
          <div class="text-h6">Start Conversation</div>
          <div class="text-caption text-medium-emphasis">
            {{ retailer?.businessName }}
          </div>
        </div>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="handleClose"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4" style="max-height: 500px;">
        <!-- Retailer Quick Info -->
        <v-card class="mb-4" variant="tonal" color="primary">
          <v-card-text>
            <div class="d-flex flex-wrap gap-2 mb-2">
              <v-chip v-if="retailer?.retailerType" size="small">
                {{ retailer.retailerType }}
              </v-chip>
              <v-chip v-if="retailer?.pricePointCategory" size="small">
                {{ retailer.pricePointCategory }}
              </v-chip>
              <v-chip v-if="retailer?.numLocations" size="small">
                {{ retailer.numLocations }} location{{ retailer.numLocations !== 1 ? 's' : '' }}
              </v-chip>
            </div>
            <p v-if="retailer?.city || retailer?.state" class="text-body-2 mb-0">
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              {{ formatLocation(retailer) }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Product Selection -->
        <div class="mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            Include Products (Optional)
          </h3>
          <p class="text-caption text-medium-emphasis mb-3">
            Select products to add context to your conversation with the AI
          </p>

          <!-- Loading State -->
          <div v-if="loadingProducts" class="text-center py-4">
            <v-progress-circular indeterminate size="32" />
          </div>

          <!-- Products List -->
          <div v-else-if="products.length > 0" class="products-scroll">
            <v-card
              v-for="product in products"
              :key="product.id"
              class="mb-2 product-card"
              :class="{ 'selected': selectedProducts.includes(product.id) }"
              variant="outlined"
              @click="toggleProduct(product.id)"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center">
                  <v-checkbox
                    :model-value="selectedProducts.includes(product.id)"
                    hide-details
                    density="compact"
                    @click.stop="toggleProduct(product.id)"
                  />
                  <div class="flex-grow-1 ml-2">
                    <div class="font-weight-medium">{{ product.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ product.category }} • ${{ product.wholesalePrice }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Empty State -->
          <v-card v-else variant="outlined" class="pa-4 text-center">
            <v-icon size="48" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
              No products found. Add products to your catalog first.
            </p>
          </v-card>
        </div>

        <!-- Initial Message -->
        <div>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon class="mr-2">mdi-message-text</v-icon>
            Your Message
          </h3>
          <p class="text-caption text-medium-emphasis mb-3">
            Describe what you're looking for or ask the AI to help
          </p>

          <v-textarea
            v-model="initialMessage"
            placeholder="e.g., I'm interested in discussing a wholesale partnership for our sustainable activewear line..."
            rows="4"
            variant="outlined"
            hide-details
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="handleClose">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="creating"
          :disabled="!canStart"
          prepend-icon="mdi-send"
          @click="handleStartConversation"
        >
          Start Conversation
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useCompanyStore } from '@/store/company';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { computed, inject, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  retailer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'conversation-started']);

const { user } = storeToRefs(useUserStore());
const companyStore = useCompanyStore();
const $companiesApi = inject('$companiesApi');
const toast = inject('toast');

// State
const products = ref([]);
const selectedProducts = ref([]);
const initialMessage = ref('');
const loadingProducts = ref(false);
const creating = ref(false);

// Computed
const canStart = computed(() => {
  return initialMessage.value.trim().length > 0 || selectedProducts.value.length > 0;
});

// Methods
const formatLocation = (retailer) => {
  if (!retailer) return '';
  const parts = [];
  if (retailer.city) parts.push(retailer.city);
  if (retailer.state) parts.push(retailer.state);
  return parts.join(', ');
};

const toggleProduct = (productId) => {
  const index = selectedProducts.value.indexOf(productId);
  if (index > -1) {
    selectedProducts.value.splice(index, 1);
  } else {
    selectedProducts.value.push(productId);
  }
};

const fetchProducts = async () => {
  if (!user.value?.companyId) return;

  loadingProducts.value = true;
  try {
    const response = await $companiesApi.get('/get-company-products', {
      params: { companyId: user.value.companyId }
    });
    products.value = response.data.filter(p => p.status === 'active');
  } catch (error) {
    console.error('Error fetching products:', error);
    toast?.show({ message: 'Failed to load products', error: true });
  } finally {
    loadingProducts.value = false;
  }
};

const handleStartConversation = async () => {
  creating.value = true;

  try {
    // Create conversation with retailer context
    const conversationData = {
      companyId: user.value.companyId,
      title: `Conversation with ${props.retailer.businessName}`,
      context: {
        retailerId: props.retailer.id,
        retailerName: props.retailer.businessName,
        retailerType: props.retailer.retailerType,
        retailerLocation: formatLocation(props.retailer),
        productIds: selectedProducts.value,
      },
      messages: []
    };

    // Add initial message if provided
    if (initialMessage.value.trim()) {
      conversationData.messages.push({
        role: 'user',
        content: initialMessage.value.trim(),
        timestamp: new Date().toISOString()
      });
    }

    const response = await $companiesApi.post('/conversations', conversationData);

    toast?.show({ 
      message: `Conversation started with ${props.retailer.businessName}`,
      error: false 
    });

    emit('conversation-started', response.data.id);
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast?.show({ 
      message: 'Failed to start conversation', 
      error: true 
    });
  } finally {
    creating.value = false;
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
  // Reset state
  setTimeout(() => {
    selectedProducts.value = [];
    initialMessage.value = '';
  }, 300);
};

// Watch for dialog open/close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.retailer) {
    fetchProducts();
  }
});
</script>

<style scoped>
.products-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.product-card {
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.product-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Custom scrollbar for products */
.products-scroll::-webkit-scrollbar {
  width: 6px;
}

.products-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.products-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.products-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>