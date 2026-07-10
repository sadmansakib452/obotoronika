<script lang="ts" setup>
import { X, Upload } from 'lucide-vue-next'

interface FilePreview {
  file: File
  url: string
}

interface ExistingImage {
  url: string
  name: string
}

const props = defineProps<{
  modelValue: File | File[] | null | undefined
  label: string
  multiple?: boolean
  maxSizeMb?: number
  existingImages?: ExistingImage[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null]
}>()

const isDragOver = ref(false)
const fileError = ref('')
const localPreviews = ref<FilePreview[]>([])

const maxSize = computed(() => (props.maxSizeMb || 5) * 1024 * 1024)
const inputId = computed(() => `file-upload-${props.label.replace(/\s+/g, '-').toLowerCase()}`)

// Generate data URL for preview
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Sync localPreviews from modelValue
async function syncPreviews() {
  if (!props.modelValue) {
    localPreviews.value = []
    return
  }
  if (props.multiple) {
    const files = props.modelValue as File[]
    const existing = new Set(localPreviews.value.map(p => p.file.name + p.file.size))
    for (const file of files) {
      const key = file.name + file.size
      if (!existing.has(key)) {
        localPreviews.value.push({ file, url: await fileToDataUrl(file) })
      }
    }
  }
  else {
    const file = props.modelValue as File
    if (file && !localPreviews.value.find(p => p.file === file)) {
      localPreviews.value.push({ file, url: await fileToDataUrl(file) })
    }
  }
}

watch(() => props.modelValue, () => syncPreviews(), { deep: true })

function validateFile(file: File): boolean {
  if (!file.type.startsWith('image/')) {
    fileError.value = `"${file.name}" is not an image file.`
    return false
  }
  if (file.size > maxSize.value) {
    fileError.value = `"${file.name}" exceeds ${props.maxSizeMb || 5}MB limit.`
    return false
  }
  return true
}

async function handleFiles(files: FileList | File[]) {
  fileError.value = ''

  if (props.multiple) {
    const current = (props.modelValue as File[]) || []
    const valid: File[] = []
    for (const file of Array.from(files)) {
      if (validateFile(file)) valid.push(file)
    }
    if (valid.length) {
      const updated = [...current, ...valid]
      emit('update:modelValue', updated)
    }
  }
  else {
    const file = files[0]
    if (file && validateFile(file)) {
      emit('update:modelValue', file)
    }
  }
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) handleFiles(input.files)
  input.value = ''
}

function onDragOver(e: DragEvent) { e.preventDefault(); isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
}

function removeFile(index: number) {
  localPreviews.value.splice(index, 1)
  if (props.multiple) {
    const current = ((props.modelValue as File[]) || []).filter((_, i) => i !== index)
    emit('update:modelValue', current.length ? current : null)
  }
  else {
    emit('update:modelValue', null)
  }
}

function removeExisting(index: number) {
  if (!props.existingImages) return
  const remaining = props.existingImages.filter((_, i) => i !== index)
  emit('update:modelValue', remaining.length ? (props.multiple ? [] : null) : null)
}
</script>

<template>
  <div class="image-uploader">
    <label :for="inputId" class="upload-zone" :class="{ 'drag-over': isDragOver }" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
      <input :id="inputId" type="file" :accept="'image/*'" :multiple="multiple" class="sr-only" @change="onInputChange">
      <div class="upload-zone-content">
        <Upload :size="28" class="upload-zone-icon" />
        <p class="upload-zone-text">
          Drop {{ multiple ? 'images' : 'an image' }} here or click to browse
        </p>
        <p class="upload-zone-hint">
          PNG, JPG, GIF up to {{ maxSizeMb || 5 }}MB
        </p>
      </div>
    </label>

    <p v-if="fileError" class="upload-error">{{ fileError }}</p>

    <div v-if="localPreviews.length || existingImages?.length" class="upload-previews">
      <!-- Existing images (edit mode) -->
      <div v-for="(img, idx) in existingImages" :key="'e' + idx" class="preview-item">
        <img :src="img.url" class="preview-img" :alt="img.name">
        <div class="preview-actions">
          <button type="button" class="preview-remove" aria-label="Remove existing image" @click="removeExisting(idx)">
            <X :size="14" />
          </button>
        </div>
      </div>

      <!-- New file previews -->
      <div v-for="(item, index) in localPreviews" :key="'n' + index" class="preview-item">
        <img :src="item.url" class="preview-img" :alt="item.file.name">
        <div class="preview-info">
          <span class="preview-name">{{ item.file.name }}</span>
          <span class="preview-size">{{ (item.file.size / 1024).toFixed(1) }} KB</span>
        </div>
        <button type="button" class="preview-remove" :aria-label="'Remove image'" @click="removeFile(index)">
          <X :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  @apply space-y-3;
}
.upload-zone {
  @apply flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 px-6 py-6 transition-colors hover:border-primary/50 hover:bg-primary/5;
}
.upload-zone.drag-over {
  @apply border-primary bg-primary/10;
}
.upload-zone-content {
  @apply flex flex-col items-center gap-1.5 text-center;
}
.upload-zone-icon {
  @apply text-gray-400 dark:text-gray-500;
}
.upload-zone-text {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}
.upload-zone-hint {
  @apply text-xs text-gray-400 dark:text-gray-500;
}
.upload-error {
  @apply text-sm text-red-500 dark:text-red-400;
}
.upload-previews {
  @apply grid grid-cols-2 gap-3 sm:grid-cols-3;
}
.preview-item {
  @apply relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5;
}
.preview-img {
  @apply h-28 w-full object-cover;
}
.preview-info {
  @apply flex flex-col px-2 py-1.5;
}
.preview-name {
  @apply truncate text-xs text-gray-700 dark:text-gray-300;
}
.preview-size {
  @apply text-[11px] text-gray-400 dark:text-gray-500;
}
.preview-actions {
  @apply absolute right-1 top-1;
}
.preview-remove {
  @apply flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70;
}
.preview-item:hover .preview-remove {
  @apply opacity-100;
}
</style>
