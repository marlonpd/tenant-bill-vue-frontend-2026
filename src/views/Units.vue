<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { UnitsService, type UnitItem } from '@/apis/services/units'
import { API_URL } from '@/apis/config'

const units = ref<UnitItem[]>([])
const loading = ref(false)
const message = ref('')
const error = ref('')

const form = ref({
  name: '',
  description: '',
  rate: '',
  electric_meter_no: '',
  water_meter_no: '',
})
const photoFiles = ref<File[]>([])
const createPhotoPreviews = ref<string[]>([])
const unitPhotoUploadFiles = ref<Record<number, File[]>>({})
const unitPhotoPreviews = ref<Record<number, string[]>>({})
const selectedTablePhoto = ref<string | null>(null)

function revokePreviewUrls(urls: string[]) {
  for (const url of urls) {
    URL.revokeObjectURL(url)
  }
}

async function fetchUnits() {
  try {
    const { data } = await UnitsService.getAll()
    units.value = data.units || []
  } catch {
    units.value = []
  }
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    rate: '',
    electric_meter_no: '',
    water_meter_no: '',
  }
  photoFiles.value = []
  revokePreviewUrls(createPhotoPreviews.value)
  createPhotoPreviews.value = []
}

function onPhotosSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  photoFiles.value = files
  revokePreviewUrls(createPhotoPreviews.value)
  createPhotoPreviews.value = files.map((file) => URL.createObjectURL(file))
}

function onUnitPhotosSelected(unitId: number, event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  revokePreviewUrls(unitPhotoPreviews.value[unitId] || [])
  unitPhotoUploadFiles.value = {
    ...unitPhotoUploadFiles.value,
    [unitId]: files,
  }
  unitPhotoPreviews.value = {
    ...unitPhotoPreviews.value,
    [unitId]: files.map((file) => URL.createObjectURL(file)),
  }
}

async function submitUnit() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    await UnitsService.create({
      unit_no: form.value.name,
      description: form.value.description || null,
      rate: form.value.rate ? Number(form.value.rate) : null,
      photos: photoFiles.value,
      electric_meter_no: form.value.electric_meter_no || null,
      water_meter_no: form.value.water_meter_no || null,
    })

    message.value = 'Unit created successfully.'
    resetForm()
    await fetchUnits()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to create unit.'
  } finally {
    loading.value = false
  }
}

async function uploadMorePhotos(unit: UnitItem) {
  const selected = unitPhotoUploadFiles.value[unit.id] || []
  if (selected.length === 0) {
    error.value = 'Select at least one photo to upload.'
    return
  }

  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await UnitsService.addPhotos(unit.id, selected)
    message.value = `Photos uploaded for ${unit.unit_no}.`
    revokePreviewUrls(unitPhotoPreviews.value[unit.id] || [])
    unitPhotoUploadFiles.value = {
      ...unitPhotoUploadFiles.value,
      [unit.id]: [],
    }
    unitPhotoPreviews.value = {
      ...unitPhotoPreviews.value,
      [unit.id]: [],
    }
    await fetchUnits()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to upload photos.'
  } finally {
    loading.value = false
  }
}

async function deletePhoto(unit: UnitItem, photoUrl: string) {
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await UnitsService.removePhoto(unit.id, photoUrl)
    message.value = 'Photo removed successfully.'
    await fetchUnits()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to remove photo.'
  } finally {
    loading.value = false
  }
}

function openTablePhotoPreview(photoUrl: string) {
  selectedTablePhoto.value = photoUrl
}

function closeTablePhotoPreview() {
  selectedTablePhoto.value = null
}

function resolvePhotoUrl(photoUrl: string) {
  if (!photoUrl) return ''
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl
  if (photoUrl.startsWith('data:')) return photoUrl

  const apiBaseWithoutApi = API_URL.replace(/\/api\/?$/, '')
  if (!apiBaseWithoutApi) return photoUrl

  if (photoUrl.startsWith('/')) {
    return `${apiBaseWithoutApi}${photoUrl}`
  }

  return `${apiBaseWithoutApi}/${photoUrl}`
}

onMounted(() => {
  fetchUnits()
})

onUnmounted(() => {
  revokePreviewUrls(createPhotoPreviews.value)
  for (const urls of Object.values(unitPhotoPreviews.value)) {
    revokePreviewUrls(urls)
  }
})
</script>

<template>
  <section class="page-wrap">
    <h2>Create Unit</h2>

    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submitUnit">
      <input v-model="form.name" type="text" placeholder="Unit name" required />
      <input v-model="form.description" type="text" placeholder="Description (optional)" />
      <input v-model="form.rate" type="number" min="0" step="0.01" placeholder="Rate" />
      <input
        v-model="form.electric_meter_no"
        type="text"
        placeholder="Electric meter ID (optional)"
      />
      <input
        v-model="form.water_meter_no"
        type="text"
        placeholder="Water meter ID (optional)"
      />
      <input type="file" multiple accept="image/*" @change="onPhotosSelected" />
      <div v-if="createPhotoPreviews.length" class="preview-wrap">
        <p>Selected photos preview:</p>
        <div class="photo-grid">
          <img
            v-for="(previewUrl, index) in createPhotoPreviews"
            :key="`create-preview-${index}`"
            :src="previewUrl"
            alt="Selected photo preview"
            class="photo-thumb"
          />
        </div>
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">Create Unit</button>
        <button type="button" :disabled="loading" @click="resetForm">Clear</button>
      </div>
    </form>

    <h3>Units</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Description</th>
          <th>Rate</th>
          <th>Photos</th>
          <th>Electric meter ID</th>
          <th>Water meter ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(unit, index) in units" :key="unit.id || index">
          <td>{{ index + 1 }}</td>
          <td>{{ unit.unit_no }}</td>
          <td>{{ unit.description || '-' }}</td>
          <td>{{ unit.rate !== null && unit.rate !== undefined ? unit.rate : '-' }}</td>
          <td>
            <div v-if="unit.photo_urls && unit.photo_urls.length" class="photo-grid">
              <div
                v-for="(photoUrl, photoIndex) in unit.photo_urls"
                :key="`${unit.id}-${photoIndex}`"
                class="photo-item"
              >
                <button
                  type="button"
                  class="photo-preview-btn"
                  @click="openTablePhotoPreview(resolvePhotoUrl(photoUrl))"
                >
                  <img :src="resolvePhotoUrl(photoUrl)" alt="Unit photo" class="photo-thumb" />
                </button>
                <button
                  type="button"
                  class="photo-delete-btn"
                  :disabled="loading"
                  @click="deletePhoto(unit, photoUrl)"
                >
                  Remove
                </button>
              </div>
            </div>
            <span v-else>-</span>
            <div class="photo-upload-inline">
              <input type="file" multiple accept="image/*" @change="onUnitPhotosSelected(unit.id, $event)" />
              <button type="button" :disabled="loading" @click="uploadMorePhotos(unit)">Add Photos</button>
              <div v-if="unitPhotoPreviews[unit.id] && unitPhotoPreviews[unit.id].length" class="preview-wrap">
                <p>New photos preview:</p>
                <div class="photo-grid">
                  <img
                    v-for="(previewUrl, previewIndex) in unitPhotoPreviews[unit.id]"
                    :key="`unit-preview-${unit.id}-${previewIndex}`"
                    :src="previewUrl"
                    alt="Unit photo preview"
                    class="photo-thumb"
                  />
                </div>
              </div>
            </div>
          </td>
          <td>{{ unit.electric_meter_no || '-' }}</td>
          <td>{{ unit.water_meter_no || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <Teleport to="body">
      <div v-if="selectedTablePhoto" class="preview-overlay" @click.self="closeTablePhotoPreview">
        <div class="preview-card">
          <img :src="selectedTablePhoto" alt="Unit photo preview" class="preview-image" />
          <button type="button" @click="closeTablePhotoPreview">Close</button>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.photo-preview-btn {
  min-height: auto;
  padding: 0;
  border: none;
  background: transparent;
}

.photo-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.photo-upload-inline {
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.preview-wrap p {
  font-size: 0.8rem;
  color: var(--color-text);
}

.photo-delete-btn {
  min-height: 28px;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-card {
  width: 100%;
  max-width: 760px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  padding: 0.75rem;
  display: grid;
  gap: 0.6rem;
}

.preview-image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}
</style>
