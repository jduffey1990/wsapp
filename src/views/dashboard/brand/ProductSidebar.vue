<!-- src/views/dashboard/brand/ProductSidebar.vue -->
<template>
  <v-card class="product-sidebar">
    <!-- Header -->
    <v-card-title class="d-flex justify-space-between align-center pa-3">
      <div class="d-flex align-center ga-2">
        <v-icon>mdi-package-variant</v-icon>
        <span>Products</span>
      </div>
      <v-btn
        icon="mdi-plus"
        size="small"
        variant="text"
        color="primary"
        @click="openProductDialog()"
      />
    </v-card-title>

    <v-divider />

    <!-- Loading -->
    <v-skeleton-loader
      v-if="loading"
      type="list-item-avatar-three-line@3"
    />

    <!-- Empty State -->
    <v-card-text v-else-if="products.length === 0" class="text-center py-8">
      <v-icon size="48" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
      <div class="text-body-2 mt-2 mb-3">No products yet</div>
      <v-btn
        size="small"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openProductDialog()"
      >
        Add Product
      </v-btn>
    </v-card-text>

    <!-- Product List -->
    <v-list v-else density="compact" class="pa-0">
      <v-list-item
        v-for="product in products"
        :key="product.id"
        class="product-item"
        @click="selectProduct(product)"
      >
        <!-- Product Image -->
        <template #prepend>
          <v-avatar size="48" rounded="lg">
            <v-img
              :src="product.images?.[0] || placeholderImage"
              cover
            />
          </v-avatar>
        </template>

        <!-- Product Info -->
        <v-list-item-title class="text-subtitle-2">
          {{ product.name }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          {{ formatPrice(product.wholesalePrice, product.currency) }}
          <span v-if="product.category">· {{ product.category }}</span>
        </v-list-item-subtitle>

        <!-- Status Badge -->
        <template #append>
          <v-chip
            v-if="product.status !== 'active'"
            :color="product.status === 'inactive' ? 'warning' : 'error'"
            size="x-small"
            label
          >
            {{ product.status }}
          </v-chip>
          <v-menu v-else>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="x-small"
                v-bind="props"
                @click.stop
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="openProductDialog(product)">
                <template #prepend>
                  <v-icon size="18">mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="confirmDelete(product)">
                <template #prepend>
                  <v-icon size="18" color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title class="text-error">Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>

    <!-- Product Dialog (Add/Edit) -->
    <v-dialog v-model="productDialog.open" max-width="700" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ productDialog.isEdit ? 'Edit Product' : 'Add Product' }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeProductDialog"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4" style="max-height: 70vh">
          <v-form ref="productForm">
            <!-- Name -->
            <v-text-field
              v-model="productDialog.data.name"
              label="Product Name *"
              :rules="[v => !!v || 'Name is required']"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <!-- Description -->
            <v-textarea
              v-model="productDialog.data.description"
              label="Description"
              rows="3"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <!-- Category & Subcategory -->
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="productDialog.data.category"
                  label="Category"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="productDialog.data.subcategory"
                  label="Subcategory"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <!-- Pricing -->
            <v-row dense>
              <v-col cols="5">
                <v-text-field
                  v-model.number="productDialog.data.wholesalePrice"
                  label="Wholesale Price"
                  type="number"
                  prefix="$"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model.number="productDialog.data.retailPrice"
                  label="Retail Price"
                  type="number"
                  prefix="$"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="2">
                <v-select
                  v-model="productDialog.data.currency"
                  :items="['USD', 'EUR', 'GBP', 'CAD']"
                  label="Currency"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <!-- Terms -->
            <v-row dense>
              <v-col cols="4">
                <v-text-field
                  v-model.number="productDialog.data.moq"
                  label="MOQ"
                  type="number"
                  hint="Minimum Order Qty"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="productDialog.data.casePack"
                  label="Case Pack"
                  type="number"
                  hint="Units per case"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="productDialog.data.leadTimeDays"
                  label="Lead Time"
                  type="number"
                  suffix="days"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <!-- SKU & Status -->
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="productDialog.data.sku"
                  label="SKU"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="productDialog.data.status"
                  label="Status"
                  :items="['active', 'inactive', 'discontinued']"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <!-- Images -->
            <div class="mb-2">
              <v-text-field
                v-model="imageUrl"
                label="Image URL"
                hint="Add image URLs one at a time"
                variant="outlined"
                density="comfortable"
                @keyup.enter="addImage"
              >
                <template #append-inner>
                  <v-btn
                    icon="mdi-plus"
                    size="small"
                    variant="text"
                    @click="addImage"
                  />
                </template>
              </v-text-field>
              <div v-if="productDialog.data.images?.length" class="d-flex flex-wrap ga-2 mt-2">
                <v-chip
                  v-for="(img, idx) in productDialog.data.images"
                  :key="idx"
                  closable
                  size="small"
                  @click:close="removeImage(idx)"
                >
                  Image {{ idx + 1 }}
                </v-chip>
              </div>
            </div>

            <!-- Attributes (Optional Advanced Section) -->
            <v-expansion-panels variant="accordion" class="mt-2">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2">mdi-tag-multiple</v-icon>
                  Attributes (Optional)
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="text-caption text-medium-emphasis mb-2">
                    Add custom attributes like colors, materials, sizes, etc.
                  </div>
                  <!-- Simplified attribute entry - you can enhance this -->
                  <v-textarea
                    v-model="attributesText"
                    label="Attributes (comma-separated)"
                    placeholder="e.g., Cotton, Black, Medium, Organic"
                    rows="2"
                    variant="outlined"
                    density="comfortable"
                    hint="Separate multiple values with commas"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeProductDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveProduct"
          >
            {{ productDialog.isEdit ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.open" max-width="400">
      <v-card>
        <v-card-title>Delete Product?</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ deleteDialog.product?.name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog.open = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteProduct"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Product Detail Dialog (View Only) -->
    <v-dialog v-model="detailDialog.open" max-width="600" scrollable>
      <v-card v-if="detailDialog.product">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ detailDialog.product.name }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="detailDialog.open = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4" style="max-height: 70vh">
          <!-- Product Image -->
          <v-img
            v-if="detailDialog.product.images?.[0]"
            :src="detailDialog.product.images[0]"
            height="200"
            cover
            class="mb-4 rounded"
          />

          <!-- Description -->
          <div v-if="detailDialog.product.description" class="mb-4">
            <div class="text-subtitle-2 mb-1">Description</div>
            <div class="text-body-2">{{ detailDialog.product.description }}</div>
          </div>

          <!-- Pricing -->
          <v-row dense class="mb-4">
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Wholesale Price</div>
              <div class="text-h6">
                {{ formatPrice(detailDialog.product.wholesalePrice, detailDialog.product.currency) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Retail Price</div>
              <div class="text-h6">
                {{ formatPrice(detailDialog.product.retailPrice, detailDialog.product.currency) }}
              </div>
            </v-col>
          </v-row>

          <!-- Terms -->
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Terms</div>
            <v-row dense>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">MOQ</div>
                <div>{{ detailDialog.product.moq || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Case Pack</div>
                <div>{{ detailDialog.product.casePack || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Lead Time</div>
                <div>
                  {{ detailDialog.product.leadTimeDays ? `${detailDialog.product.leadTimeDays} days` : '—' }}
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Category -->
          <div v-if="detailDialog.product.category" class="mb-4">
            <div class="text-subtitle-2 mb-1">Category</div>
            <v-chip size="small" label>{{ detailDialog.product.category }}</v-chip>
            <v-chip
              v-if="detailDialog.product.subcategory"
              size="small"
              label
              class="ml-1"
            >
              {{ detailDialog.product.subcategory }}
            </v-chip>
          </div>

          <!-- Attributes -->
          <div v-if="detailDialog.product.attributes" class="mb-4">
            <div class="text-subtitle-2 mb-2">Attributes</div>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="(val, key) in flattenedAttributes(detailDialog.product.attributes)"
                :key="`${key}-${val}`"
                size="x-small"
                label
                variant="outlined"
              >
                {{ val }}
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            prepend-icon="mdi-pencil"
            @click="editFromDetail"
          >
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { useCompanyStore } from '@/store/company'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

/* Stores */
const companyStore = useCompanyStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { products } = storeToRefs(companyStore)

/* Toast */
const toast = inject('toast')?.show

/* State */
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const imageUrl = ref('')
const attributesText = ref('')
const productForm = ref(null)

const placeholderImage = 'https://dummyimage.com/400x400/eeeeee/aaaaaa.png&text=No+Image'

/* Product Dialog */
const productDialog = ref({
  open: false,
  isEdit: false,
  data: getEmptyProduct()
})

/* Delete Dialog */
const deleteDialog = ref({
  open: false,
  product: null
})

/* Detail Dialog */
const detailDialog = ref({
  open: false,
  product: null
})

/* Helper Functions */
function getEmptyProduct() {
  return {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    wholesalePrice: null,
    retailPrice: null,
    currency: 'USD',
    moq: null,
    casePack: null,
    leadTimeDays: null,
    attributes: {},
    images: [],
    status: 'active',
    sku: ''
  }
}

function formatPrice(price, currency = 'USD') {
  if (!price) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

function flattenedAttributes(attrs) {
  if (!attrs) return []
  const result = []
  for (const [key, val] of Object.entries(attrs)) {
    if (Array.isArray(val)) {
      result.push(...val)
    } else {
      result.push(val)
    }
  }
  return result
}

/* API Calls via Store */
async function fetchProducts() {
  if (!user.value?.companyId) {
    toast?.({ message: 'No company associated with user', error: true })
    return
  }

  loading.value = true
  try {
    await companyStore.fetchProducts(user.value.companyId)
  } catch (error) {
    console.error('Error fetching products:', error)
    toast?.({ message: 'Failed to load products', error: true })
  } finally {
    loading.value = false
  }
}

async function saveProduct() {
  if (!user.value?.companyId) return

  // Validate form
  const { valid } = await productForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      ...productDialog.value.data,
      companyId: user.value.companyId
    }

    // Parse attributes from text
    if (attributesText.value) {
      const attrs = attributesText.value.split(',').map(s => s.trim()).filter(Boolean)
      payload.attributes = { tags: attrs }
    }

    if (productDialog.value.isEdit) {
      // Update
      await companyStore.updateProduct(productDialog.value.data.id, payload)
      toast?.({ message: 'Product updated successfully' })
    } else {
      // Create
      await companyStore.createProduct(payload)
      toast?.({ message: 'Product created successfully' })
    }

    closeProductDialog()
  } catch (error) {
    console.error('Error saving product:', error)
    toast?.({ message: 'Failed to save product', error: true })
  } finally {
    saving.value = false
  }
}

async function deleteProduct() {
  if (!deleteDialog.value.product) return

  deleting.value = true
  try {
    await companyStore.deleteProduct(deleteDialog.value.product.id)
    toast?.({ message: 'Product deleted successfully' })
    deleteDialog.value.open = false
    deleteDialog.value.product = null
  } catch (error) {
    console.error('Error deleting product:', error)
    toast?.({ message: 'Failed to delete product', error: true })
  } finally {
    deleting.value = false
  }
}

/* Dialog Management */
function openProductDialog(product = null) {
  if (product) {
    productDialog.value.isEdit = true
    productDialog.value.data = { ...product }
    // Populate attributes text
    if (product.attributes?.tags) {
      attributesText.value = product.attributes.tags.join(', ')
    }
  } else {
    productDialog.value.isEdit = false
    productDialog.value.data = getEmptyProduct()
    attributesText.value = ''
  }
  productDialog.value.open = true
}

function closeProductDialog() {
  productDialog.value.open = false
  productDialog.value.data = getEmptyProduct()
  imageUrl.value = ''
  attributesText.value = ''
}

function confirmDelete(product) {
  deleteDialog.value.product = product
  deleteDialog.value.open = true
}

function selectProduct(product) {
  detailDialog.value.product = product
  detailDialog.value.open = true
}

function editFromDetail() {
  const product = detailDialog.value.product
  detailDialog.value.open = false
  openProductDialog(product)
}

/* Image Management */
function addImage() {
  if (!imageUrl.value.trim()) return
  if (!productDialog.value.data.images) {
    productDialog.value.data.images = []
  }
  productDialog.value.data.images.push(imageUrl.value.trim())
  imageUrl.value = ''
}

function removeImage(index) {
  productDialog.value.data.images.splice(index, 1)
}

/* Lifecycle */
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-sidebar {
  height: calc(100vh - 280px);
  overflow-y: auto;
  position: sticky;
  top: 12px;
}

.product-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>