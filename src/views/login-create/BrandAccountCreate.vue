<template>
  <v-form @submit.prevent='onSubmit'>
    <!-- Tabs -->
    <v-tabs v-model="tab" align-tabs="center" class="mb-4">
      <v-tab value="join">Enter Access Code</v-tab>
      <v-tab value="create">Create a New Brand</v-tab>
    </v-tabs>

    <!-- Tab content -->
    <v-window v-model="tab">
      <!-- JOIN EXISTING BRAND -->
      <v-window-item value="join">
        <v-text-field
          v-model.trim="passcode"
          label="Brand Passcode"
          hint="Paste the code your team shared with you"
          persistent-hint
          required
        />

        <br />
        <br />


        <!-- Account fields live inside the SAME v-form -->
        <ProfileAccountFields
          v-model="accountForm"       
          :disabled="loading"
          @valid="accountValid = $event"
          ref="accountRef"
        />
        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="loading" :disabled="!canJoin">
            Join Brand
          </v-btn>
        </div>
      </v-window-item>

      <!-- CREATE NEW BRAND -->
      <v-window-item value="create">
        <v-text-field v-model.trim="brandForm.name" label="Brand Name" required />

        <!-- New: optional verification method + dynamic field -->
        <v-select
          v-model="verify.method"
          :items="verify.methodOptions"
          label="(Optional) Choose a verification method"
          hint="Add one helpful signal for faster verification"
          persistent-hint
          class="mt-2"
          clearable
        />

        <v-expand-transition>
          <div v-if="verify.method" class="mt-2">
            <!-- Business website URL -->
            <v-text-field
              v-if="verify.method === 'website'"
              v-model.trim="verify.payload.website"
              label="Business website URL"
              type="url"
              placeholder="https://brand.com"
              :rules="[rules.url]"
              persistent-hint
              hint="Tip: Use your main landing page"
            />

            <!-- Headquarters address (freeform for now) -->
            <v-text-field
              v-else-if="verify.method === 'address'"
              v-model.trim="verify.payload.address"
              label="Headquarters address"
              placeholder="123 Main St, City, ST 00000"
              persistent-hint
              hint="We’ll attempt a quick lookup preview"
            />

            <!-- Linkedin handle -->
             <v-text-field
              v-else-if="verify.method === 'linkedin'"
              v-model.trim="verify.payload.linkedin"
              label="Linkedin URL"
              placeholder="https://www.linkedin.com/company/.../"
              :rules="[rules.url]"
              persistent-hint
              hint="We’ll attempt a quick lookup preview"
            />
            
          </div>
        </v-expand-transition>

        <!-- Account fields live inside SAME v-form -->
        <ProfileAccountFields
          v-model="accountForm"
          :disabled="loading"
          @valid="accountValid = $event"
          ref="accountRef"
        />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>

          <!-- Intercept submit: show verification overlay first -->
          <v-btn
            color="primary"
            :loading="loading || verify.loadingPreview"
            :disabled="!canCreate"
            @click="handleCreateClick"
          >
            Create Brand
          </v-btn>
        </div>

        <!-- Verify & Confirm dialog -->
        <v-dialog v-model="verify.dialogOpen" max-width="720">
          <v-card>
            <v-card-title class="text-h6">Verify details</v-card-title>
            <v-card-subtitle v-if="verify.method" class="px-4">
              Method: <strong class="text-capitalize">{{ verify.method }}</strong>
            </v-card-subtitle>

            <v-card-text>
              <v-skeleton-loader
                v-if="verify.loadingPreview"
                type="image, list-item-two-line, list-item-two-line"
              />

              <div v-else>
                <!-- ===== URL ===== -->
                <template v-if="verify.preview?.kind === 'url'">
                  <div class="d-flex align-start ga-3 mb-3">
                    <v-img
                      :src="verify.preview.image || verify.preview.meta?.image || verify.preview.favicon"
                      width="48" height="48" class="rounded" cover
                    />
                    <div class="min-w-0">
                      <!-- host -->
                      <div class="text-caption text-medium-emphasis">{{ verify.preview.host }}</div>

                      <!-- title / name -->
                      <div class="font-weight-medium text-truncate">
                        {{ decodeHtml(verify.preview.name || verify.preview.meta?.title) || verify.preview.url }}
                      </div>

                      <!-- description (prefer normalized/enriched, else OG) -->
                      <div class="text-body-2 text-truncate-2 mt-1"
                          v-if="verify.preview.shortDescription || verify.preview.meta?.description || verify.preview.enrichment?.shortDescription">
                        {{
                          decodeHtml(
                            verify.preview.shortDescription
                            || verify.preview.enrichment?.shortDescription
                            || verify.preview.meta?.description
                          )
                        }}
                      </div>

                      <!-- CEO / Founded / HQ (inline, hide if absent) -->
                      <div class="d-flex flex-wrap ga-4 mt-2">
                        <div v-if="verify.preview.ceoName || verify.preview.enrichment?.ceoName"
                            class="text-body-2 d-inline-flex align-center">
                          <v-icon size="16" class="me-1" icon="mdi-account-tie" />
                          {{ verify.preview.ceoName || verify.preview.enrichment?.ceoName }}
                        </div>

                        <div v-if="verify.preview.foundingYear || verify.preview.enrichment?.foundingYear"
                            class="text-body-2 d-inline-flex align-center">
                          <v-icon size="16" class="me-1" icon="mdi-calendar-star" />
                          Founded {{ verify.preview.foundingYear || verify.preview.enrichment?.foundingYear }}
                        </div>

                        <div v-if="verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress"
                            class="text-body-2 d-inline-flex align-center text-truncate" style="max-width: 560px;">
                          <v-icon size="16" class="me-1" icon="mdi-map-marker" />
                          <span class="text-truncate">
                            {{ verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress }}
                          </span>
                        </div>
                      </div>

                      <!-- categories (chips) -->
                      <div class="d-flex flex-wrap ga-2 mt-2"
                          v-if="(verify.preview.categories && verify.preview.categories.length)
                              || (verify.preview.enrichment?.categories && verify.preview.enrichment.categories.length)">
                        <v-chip
                          v-for="cat in (verify.preview.categories || verify.preview.enrichment?.categories || [])"
                          :key="cat"
                          size="small" variant="tonal" density="comfortable"
                        >
                          {{ cat }}
                        </v-chip>
                      </div>

                      <!-- CTAs -->
                      <div class="mt-2 d-flex ga-3">
                        <a :href="verify.preview.website || verify.preview.url" target="_blank" rel="noopener">Open site</a>
                        <a v-if="verify.preview.url && verify.preview.website && verify.preview.website !== verify.preview.url"
                          :href="verify.preview.url" target="_blank" rel="noopener">Original URL</a>
                      </div>

                      <!-- warning if OG failed -->
                      <v-alert
                        v-if="verify.preview.meta && verify.preview.meta.ok === false"
                        type="warning" variant="tonal" class="mt-3"
                      >
                        Couldn’t read page metadata (status {{ verify.preview.meta.status || 'unknown' }}).
                        We’ll still use the URL and favicon.
                      </v-alert>
                    </div>
                  </div>
                </template>


                <!-- ===== LINKEDIN ===== -->
                <template v-else-if="verify.preview?.kind === 'linkedin'">
                  <div class="d-flex align-start ga-3 mb-3">
                    <v-img
                      :src="verify.preview.image || verify.preview.meta?.image || verify.preview.favicon"
                      width="48" height="48" class="rounded" cover
                    />
                    <div class="min-w-0">
                      <!-- origin label -->
                      <div class="text-caption text-medium-emphasis">linkedin.com</div>

                      <!-- title / name (prefer normalized name over OG title) -->
                      <div class="font-weight-medium text-truncate">
                        {{ verify.preview.name || decodeHtml(verify.preview.meta?.title) || verify.preview.url }}
                      </div>

                      <!-- description (prefer normalized shortDescription, else OG) -->
                      <div class="text-body-2 text-truncate-2 mt-1"
                          v-if="verify.preview.shortDescription || verify.preview.meta?.description">
                        {{
                          decodeHtml(
                            verify.preview.shortDescription
                            || verify.preview.meta?.description
                          )
                        }}
                      </div>

                      <!-- CEO / Founded / HQ (inline; render only if present) -->
                      <div class="d-flex flex-wrap ga-4 mt-2">
                        <div v-if="verify.preview.ceoName || verify.preview.enrichment?.ceoName"
                            class="text-body-2 d-inline-flex align-center">
                          <v-icon size="16" class="me-1" icon="mdi-account-tie" />
                          {{ verify.preview.ceoName || verify.preview.enrichment?.ceoName }}
                        </div>

                        <div v-if="verify.preview.foundingYear || verify.preview.enrichment?.foundingYear"
                            class="text-body-2 d-inline-flex align-center">
                          <v-icon size="16" class="me-1" icon="mdi-calendar-star" />
                          Founded {{ verify.preview.foundingYear || verify.preview.enrichment?.foundingYear }}
                        </div>

                        <div v-if="verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress"
                            class="text-body-2 d-inline-flex align-center text-truncate" style="max-width: 560px;">
                          <v-icon size="16" class="me-1" icon="mdi-map-marker" />
                          <span class="text-truncate">
                            {{ verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress }}
                          </span>
                        </div>
                      </div>

                      <!-- categories (chips) -->
                      <div class="d-flex flex-wrap ga-2 mt-2"
                          v-if="(verify.preview.categories && verify.preview.categories.length)
                              || (verify.preview.enrichment?.categories && verify.preview.enrichment.categories.length)">
                        <v-chip
                          v-for="cat in (verify.preview.categories || verify.preview.enrichment?.categories || [])"
                          :key="cat"
                          size="small" variant="tonal" density="comfortable"
                        >
                          {{ cat }}
                        </v-chip>
                      </div>

                      <!-- CTAs: LinkedIn + Official site when available -->
                      <div class="mt-2 d-flex ga-3">
                        <a :href="verify.preview.url" target="_blank" rel="noopener">Open on LinkedIn</a>
                        <a v-if="verify.preview.website"
                          :href="verify.preview.website"
                          target="_blank" rel="noopener">Official site</a>
                      </div>

                      <!-- login wall note -->
                      <v-alert
                        v-if="verify.preview.limited"
                        type="info" variant="tonal" class="mt-3"
                      >
                        Limited preview (LinkedIn login wall). We’ll still save the URL.
                      </v-alert>
                    </div>
                  </div>
                </template>


                <!-- ===== ADDRESS / GOOGLE PLACES ===== -->
                <template v-else-if="verify.preview?.kind === 'address'">
                  <div class="pa-3 rounded soft-surface">
                    <!-- Header row: favicon/logo + name -->
                    <div class="d-flex align-start ga-3 mb-2">
                      <div class="min-w-0">
                        <div class="font-weight-medium text-truncate">
                          {{ verify.preview.name || verify.preview.place?.name || 'No match found' }}
                        </div>
                        <div class="text-caption text-medium-emphasis" v-if="verify.preview.website">
                          <a v-if="verify.preview.url && verify.preview.website && verify.preview.website !== verify.preview.url"
                          :href="verify.preview.url" target="_blank" rel="noopener">Original URL</a>
                        </div>
                      </div>
                      <v-img
                      :src="verify.preview.image || verify.preview.meta?.image || verify.preview.favicon"
                      width="48" height="48" class="rounded"
                    />
                      
                    </div>

                    <!-- Address -->
                    <div class="text-body-2" v-if="verify.preview.headquartersAddress || verify.preview.place?.address">
                      {{ verify.preview.headquartersAddress || verify.preview.place?.address }}
                    </div>

                    <!-- Description -->
                    <div class="text-body-2 text-truncate-2 mt-2"
                        v-if="verify.preview.shortDescription || verify.preview.enrichment?.shortDescription">
                      {{
                        verify.preview.shortDescription
                        || verify.preview.enrichment?.shortDescription
                      }}
                    </div>

                    <!-- CEO / Founded / HQ (inline chips/lines) -->
                    <div class="d-flex flex-wrap ga-4 mt-2">
                      <div v-if="verify.preview.ceoName || verify.preview.enrichment?.ceoName"
                          class="text-body-2 d-inline-flex align-center">
                        <v-icon size="16" class="me-1" icon="mdi-account-tie" />
                        {{ verify.preview.ceoName || verify.preview.enrichment?.ceoName }}
                      </div>

                      <div v-if="verify.preview.foundingYear || verify.preview.enrichment?.foundingYear"
                          class="text-body-2 d-inline-flex align-center">
                        <v-icon size="16" class="me-1" icon="mdi-calendar-star" />
                        Founded {{ verify.preview.foundingYear || verify.preview.enrichment?.foundingYear }}
                      </div>

                      <div v-if="verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress"
                          class="text-body-2 d-inline-flex align-center text-truncate" style="max-width: 560px;">
                        <v-icon size="16" class="me-1" icon="mdi-map-marker" />
                        <span class="text-truncate">
                          {{ verify.preview.headquartersAddress || verify.preview.enrichment?.headquartersAddress }}
                        </span>
                      </div>
                    </div>

                    <!-- Categories -->
                    <div class="d-flex flex-wrap ga-2 mt-2"
                        v-if="(verify.preview.categories && verify.preview.categories.length)
                            || (verify.preview.enrichment?.categories && verify.preview.enrichment.categories.length)">
                      <v-chip
                        v-for="cat in (verify.preview.categories || verify.preview.enrichment?.categories || [])"
                        :key="cat"
                        size="small" variant="tonal" density="comfortable"
                      >
                        {{ cat }}
                      </v-chip>
                    </div>

                    <!-- Map -->
                    <div class="mt-3" v-if="verify.preview.location || verify.preview.place?.location">
                      <MapboxMap
                        :lat="(verify.preview.location || verify.preview.place.location).lat"
                        :lng="(verify.preview.location || verify.preview.place.location).lng"
                        :zoom="14"
                      />
                    </div>

                    <!-- CTAs -->
                    <div class="mt-2 d-flex ga-4">
                      <a v-if="verify.preview.place?.mapLink"
                        :href="verify.preview.place.mapLink" target="_blank" rel="noopener">Open in Google Maps</a>
                      <a v-if="verify.preview.website"
                        :href="verify.preview.website" target="_blank" rel="noopener">Official site</a>
                    </div>

                    <!-- Fallback alert -->
                    <v-alert v-if="!verify.preview.place?.mapLink" type="warning" variant="tonal" class="mt-3">
                      We couldn’t resolve this address. Try a different format or include city/state.
                    </v-alert>
                  </div>
                </template>


                <!-- ===== NO METHOD OR UNKNOWN ===== -->
                <template v-else>
                  <v-alert type="warning" variant="tonal">
                    No verification method selected or unrecognized preview format.
                  </v-alert>
                </template>
              </div>

            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="verify.dialogOpen = false">Back</v-btn>
              <v-btn color="primary" :loading="loading" @click="finalizeCreate">
                Confirm & Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { inject, reactive, ref, computed } from 'vue'
import ProfileAccountFields from './ProfileAccountFields.vue'
import MapboxMap from '@/components/MapBoxMap.vue'
const showToast = inject('toast')?.show

//EMITS
const emit = defineEmits(['brand-linked', 'cancel', "created", "joined"])

//TAB AND PAGE
const loading = ref(false)
const tab = ref('join')           // 'join' | 'create'
const verify = ref({
  method: null, // 'website' | 'address' | "linkedin"
  methodOptions: [
    { title: 'Business website URL', value: 'website' },
    { title: 'Headquarters address', value: 'address' },
    { title: 'Linkedin URL', value: 'linkedin' },
  ],
  payload: {
    website: '',
    address: '',
    linkedin: '',
  },
  preview: {},           // data returned by quick lookup
  loadingPreview: false, // spinner for dialog
  dialogOpen: false,
})

const VERIFY_API = import.meta.env.VITE_BRANDORA_VERIFY_API_URL; 
function joinVerifyUrl() {
  const base = (VERIFY_API || '').replace(/\/+$/, ''); // trim trailing slash(es)
  return `${base}/verify`;
}

const isValidUrl = (v) => /^https?:\/\/[^ "]+$/i.test(v || '');
const ruleOk = (r, v) => r(v) === true || r(v) === undefined;

// JOIN via passcode
const passcode = ref('')


const brandForm = reactive({
  name: '',
  website: '',
})
const accountForm = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: ''
})
const accountValid = ref(false)
const accountRef = ref(null)

// you can store the result of brand creation here if needed
const createdBrand = ref(null)

// Parent-level gating for the “Create Brand”  or "Join Brand" submit

const canJoin = computed(() =>
  !!passcode.value && accountValid.value && !loading.value
)
const canCreate = computed(() =>
  !!brandForm.name && accountValid.value && !loading.value
)

/* Basic client-side rules (augment as needed) */
const rules = {
  url: v => !v || /^https?:\/\/[^ "]+$/i.test(v) || 'Enter a valid URL (https://...)',
}



function normalizeWebsite (url) {
  if (!url) return ''
  const hasProtocol = /^https?:\/\//i.test(url)
  return hasProtocol ? url : `https://${url}`
}

function decodeHtml(str = '') {
  const el = document.createElement('textarea');
  el.innerHTML = String(str);
  return el.value;
}


async function joinBrandDuped () {
  console.log("passscode", passcode.value)
  if (!passcode.value) return
  loading.value = true
  try {
    const { id, name } = { id: 75848949, name: 'Duffey\'s Dapper Duds' }
    showToast?.({ message: `Joined ${name}. Please verify your account in your linked email inbox, and then log in. Redirecting…`, timeout:6000 })
    emit('brand-linked', { id, name })
    emit('joined')
  } catch (e) {
  console.error('joinBrandDuped error:', e)
  const msg = e?.response?.data?.message ?? e?.message ?? 'Unexpected error'
  showToast?.({ message: msg, error: true })
  }
 finally {
    loading.value = false
  }
}

async function createBrandDuped () {
  if (!canCreate.value) {
    // optional: hard check via the child’s exposed validate()
    const ok = accountRef.value?.validate?.()
    if (!ok) {
      showToast?.({ message: 'Fix account fields before continuing.', error: true })
      return
    }
  }

  loading.value = true
  try {
    // 1) Create the brand
    const brandPayload = {
      name: brandForm.name,
      website: normalizeWebsite(brandForm.website),
    }
    const brand = { id: 75848949, name: 'Duffey\'s Dapper Duds' } // fake
    createdBrand.value = brand

    // 2) Create the user (use the data coming from child via v-model)
    const userPayload = {
      ...accountForm,
      name: `${accountForm.firstName} ${accountForm.lastName}`,
      brandId: brand.id
    }

    // Fake request wait
    await new Promise(r => setTimeout(r, 500))

    showToast?.({ message: `Brand ${brand.name} created. Account created. Please verify your account in your linked email inbox, and then log in.  Redirecting…`, timeout:6000 })
    emit('brand-linked', { id: brand.id, name: brand.name })
    emit('created')
  } catch (e) {
    const msg = e?.response?.data?.message || 'Could not create brand or account.'
    showToast?.({ message: msg, error: true })
  } finally {
    loading.value = false
  }
}

/* Small helpers for previews */
const websiteHost = computed(() => {
  try { return verify.value.payload.website ? new URL(verify.value.payload.website).hostname : '' }
  catch { return '' }
})
const websiteFavicon = computed(() =>
  websiteHost.value
    ? `https://www.google.com/s2/favicons?domain=${websiteHost.value}&sz=64`
    : ''
)

/* Intercept the primary button click: open dialog and build preview */
async function handleCreateClick() {
  // Normalize/validate based on method
  if (verify.value.method === 'website' && verify.value.payload.website) {
    verify.value.payload.website = normalizeWebsite(verify.value.payload.website);
    if (!isValidUrl(verify.value.payload.website)) {
      showToast?.({ message: 'Enter a valid website URL (https://...)', error: true });
      return;
    }
  }
  else if (verify.value.method === 'linkedin' && verify.value.payload.linkedin) {
    verify.value.payload.linkedin = normalizeWebsite(verify.value.payload.linkedin);
    if (!isValidUrl(verify.value.payload.linkedin)) {
      showToast?.({ message: 'Enter a valid LinkedIn URL (https://...)', error: true });
      return;
    }
  }


  verify.value.dialogOpen = true;
  verify.value.loadingPreview = true;
  try {
    verify.value.preview = await buildPreview(verify.value.method, verify.value.payload);
  } catch (e) {
    console.error(e);
    verify.value.preview = {};
    showToast?.({ message: e.message || 'Preview failed', error: true });
  } finally {
    verify.value.loadingPreview = false;
  }
}


async function buildPreview(method, payload) {
  if (!VERIFY_API) throw new Error('VITE_BRANDORA_VERIFY_API_URL is missing');

  let body;
  let name = brandForm.name
  switch (method) {
    case 'website':  body = { method, name, payload: { url: payload.website } }; break;
    case 'address':  body = { method, name, payload: { address: payload.address } }; break;
    case 'linkedin':  body = { method, name, payload: { url: payload.linkedin } }; break;
    default: return {}; // no method, no preview
  }

  const res = await fetch(joinVerifyUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Preview failed (${res.status})`);
  return data;
}


/* Finalize submit: close dialog and run your original submit logic */
async function finalizeCreate() {
  // Optional: attach the chosen verification to brandForm
  brandForm.verification = {
    method: verify.value.method,
    payload: { ...verify.value.payload },
    preview: verify.value.preview, // or just persist on server
  }

  verify.value.dialogOpen = false

  // If your parent <v-form> uses @submit, you can call that handler directly,
  // or trigger the same function you would on submit. Example:
  await onSubmit() // <-- call your existing create function
}

const onSubmit = async () => {
  try {
    if (tab.value === 'join') {
      await joinBrandDuped()
    } else {
      await createBrandDuped()
    }
  } catch (e) {
    console.error('Submit error:', e)
    showToast?.({ message: 'Unexpected error. See console.', error: true })
  }
}

</script>
