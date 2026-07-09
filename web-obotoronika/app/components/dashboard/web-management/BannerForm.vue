<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, USelectMenu, UTextarea } from '#components'

const props = defineProps<{
  banner?: any
}>()

const emit = defineEmits(['closeModal'])

const toast = useToast()

const state = reactive({
  image_url: props.banner?.image_url || '',
  image: null as string | null,
  title: props.banner?.title || '',
  description: props.banner?.description || '',
  button_text: props.banner?.button_text || 'Shop Now',
  button_link: props.banner?.button_link || '',
  section_id: props.banner?.section_id || null,
  status: props.banner?.status || 'active',
  display_order: props.banner?.display_order || null,
})

const isLoading = ref(false)
const sectionOptions = ref<any[]>([])
const imagePreview = ref<string | null>(props.banner?.image_url || null)

// Track if button_link was manually edited
const isButtonLinkManuallyEdited = ref(false)

// Fetch sections on mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/dashboard/sections') as any
    if (response?.data?.sections) {
      sectionOptions.value = response.data.sections
    }
  }
  catch (error) {
    console.error('Error fetching sections:', error)
    sectionOptions.value = []
  }

  // Set preview if editing and image_url exists
  if (props.banner?.image_url) {
    const config = useRuntimeConfig()
    imagePreview.value = props.banner.image_url.startsWith('http')
      ? props.banner.image_url
      : `${config.public.mediaUrl}${props.banner.image_url}`
  }

  // Check if button_link was manually set (not auto-generated)
  if (props.banner?.button_link) {
    const linkedSection = sectionOptions.value.find(s => s.slug && props.banner?.button_link === `/sections/${s.slug}`)
    isButtonLinkManuallyEdited.value = !linkedSection
  }
})

// Watch for section selection and auto-fill button_link
watch(() => state.section_id, (newSectionId) => {
  if (newSectionId) {
    const selectedSection = sectionOptions.value.find(section => section.id === newSectionId)
    if (selectedSection && selectedSection.slug) {
      // Auto-fill button_link with section slug (unless manually edited)
      if (!isButtonLinkManuallyEdited.value) {
        state.button_link = `/sections/${selectedSection.slug}`
      }
    }
  }
  else {
    // Clear button_link if section is deselected (unless manually edited)
    if (!isButtonLinkManuallyEdited.value) {
      state.button_link = ''
    }
  }
})

// Watch for manual button_link changes
watch(() => state.button_link, () => {
  isButtonLinkManuallyEdited.value = true
})

const handleFileInputChange = (e: any) => {
  const file = e[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      toast.add({ title: 'Please select an image file', color: 'red' })
      return
    }
    const fileReader = new FileReader()
    fileReader.onload = function () {
      state.image = fileReader.result as string
      imagePreview.value = fileReader.result as string
    }
    fileReader.readAsDataURL(file)
  }
}

const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().optional(),
  section_id: z.number().int().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
  display_order: z.number().int().optional().nullable(),
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true

    // Validate that image is provided for new banners
    if (!props.banner?.id && !state.image) {
      return toast.add({ title: 'Please upload an image', color: 'red' })
    }

    const payload = await schema.parseAsync(event.data)

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('title', payload.title || '')
    formData.append('description', payload.description || '')
    formData.append('button_text', payload.button_text || 'Shop Now')
    formData.append('button_link', payload.button_link || '')
    if (payload.section_id) {
      formData.append('section_id', payload.section_id.toString())
    }
    formData.append('status', payload.status || 'active')
    if (payload.display_order !== null && payload.display_order !== undefined) {
      formData.append('display_order', payload.display_order.toString())
    }

    // Add image if new file is selected
    if (state.image) {
      formData.append('image', state.image as string)
      // Add existing image_url pathname for updates (to replace old image)
      if (props.banner?.id && props.banner?.image_url) {
        formData.append('pathname', props.banner.image_url)
      }
    }

    if (props.banner?.id) {
      // Update existing banner
      await $fetch(`/api/dashboard/banners/${props.banner.id}`, {
        method: 'PATCH',
        body: formData,
      })
      emit('closeModal')
      return toast.add({ title: 'Banner updated successfully.', color: 'green' })
    }
    else {
      // Create new banner
      await $fetch('/api/dashboard/banners', {
        method: 'POST',
        body: formData,
      })
      emit('closeModal')
      return toast.add({ title: 'Banner created successfully.', color: 'green' })
    }
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || error.message || 'Failed to save banner.'
    return toast.add({ title: errorMessage, color: 'red' })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="Banner Image" name="image" required>
        <UInput
          type="file"
          size="lg"
          icon="i-heroicons-folder"
          accept="image/*"
          @change="handleFileInputChange"
        />
        <div v-if="imagePreview" class="mt-4">
          <img
            :src="imagePreview"
            alt="Banner preview"
            class="w-full h-48 object-cover rounded-lg border"
          >
        </div>
        <template #help>
          Upload a banner image (JPG, PNG, GIF)
        </template>
      </UFormGroup>

      <UFormGroup label="Title" name="title">
        <UInput v-model="state.title" size="lg" placeholder="Banner title" />
      </UFormGroup>

      <UFormGroup label="Description" name="description">
        <UTextarea
          v-model="state.description"
          autoresize
          placeholder="Banner description..."
        />
      </UFormGroup>

      <UFormGroup label="Button Text" name="button_text">
        <UInput v-model="state.button_text" size="lg" placeholder="Shop Now" />
      </UFormGroup>

      <UFormGroup label="Button Link" name="button_link">
        <UInput v-model="state.button_link" size="lg" placeholder="/sections/some-section" />
        <template #help>
          Auto-filled when a section is selected. You can edit manually if needed.
        </template>
      </UFormGroup>

      <UFormGroup label="Link to Section" name="section_id">
        <USelectMenu
          v-model="state.section_id"
          :options="sectionOptions"
          value-attribute="id"
          option-attribute="title"
          placeholder="Select a section"
          searchable
        />
        <UButton
          v-if="state.section_id"
          color="gray"
          variant="ghost"
          size="sm"
          label="Clear selection"
          class="mt-2"
          @click="() => { state.section_id = null }"
        />
        <template #help>
          Optional: Link this banner to a section. The button link will auto-fill with the section slug.
        </template>
      </UFormGroup>

      <UFormGroup label="Status" name="status">
        <USelectMenu
          v-model="state.status"
          :options="[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]"
          value-attribute="value"
          option-attribute="label"
        />
      </UFormGroup>

      <UFormGroup label="Display Order" name="display_order">
        <UInput
          v-model.number="state.display_order"
          type="number"
          size="lg"
          placeholder="1"
        />
        <template #help>
          Lower numbers appear first in the carousel
        </template>
      </UFormGroup>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
      >
        {{ banner ? 'Update Banner' : 'Create Banner' }}
      </UButton>
    </UForm>
  </div>
</template>
