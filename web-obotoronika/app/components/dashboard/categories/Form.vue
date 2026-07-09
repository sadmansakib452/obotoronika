<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { z } from 'zod'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, USelectMenu, UTextarea } from '#components'

// Composable
const route = useRoute()
const router = useRouter()
const toast = useToast()

const schema = z.object({
  name: z.string({ required_error: 'Please enter a name' }),
  slug: z.string({ required_error: 'Please enter a slug' }),
})

type Schema = z.output<typeof schema>

const state: any = reactive({
  name: undefined,
  description: undefined,
  slug: undefined,
  image: undefined,
  parent: undefined,
})

const pathname = ref('')

const handleFileInputChange = (e: any) => {
  const file = e[0]
  if (file) {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      state.image = fileReader.result as any
    }
    fileReader.readAsDataURL(file)
  }
}

// @ts-ignore
const { data } = await useFetch(`/api/dashboard/categories`)

const fetchedCategories = data.value as unknown as SuccessResponse || { categories: [] }

const categories = computed(() =>
  fetchedCategories.data?.categories.map(({ id, name }: any) => ({ id, name })),
)

const id: number | undefined = route.fullPath.split('/')[3] as number | undefined

let fetchedData: SuccessResponse | undefined = undefined

if (id && !isNaN(id)) {
  // @ts-ignore
  const { data } = await useFetch(`/api/dashboard/categories/${id}`)
  fetchedData = data.value as unknown as SuccessResponse
  if (fetchedData.data?.id) {
    state.description = fetchedData.data?.description
    state.name = fetchedData.data?.name
    state.slug = fetchedData?.data?.slug
    pathname.value = fetchedData.data?.thumbnail
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const formData = new FormData()
    formData.append('name', event.data.name)
    formData.append('slug', event.data.slug)
    if (state.description) {
      formData.append('description', state.description)
    }
    if (state.image) {
      formData.append('image', state.image as unknown as string)
    }
    if (state.parent) {
      formData.append('parent_id', state.parent)
    }

    if (id && !isNaN(id)) {
      if (state.image) {
        formData.append('pathname', pathname.value)
      }
      await $fetch(`/api/dashboard/categories/${id}`, {
        // @ts-ignore
        method: 'PATCH',
        body: formData,
      })
      router.push('/dashboard/categories')
      return toast.add({ title: 'Category updated successfully.', color: 'green' })
    }
    else {
      await $fetch('/api/dashboard/categories', {
        method: 'POST',
        body: formData,
      })
      state.description = undefined
      state.image = null
      state.name = undefined
      state.slug = undefined
      state.parent = undefined
      router.push('/dashboard/categories')
      return toast.add({ title: 'Category created successfully.', color: 'green' })
    }
  }
  catch {
    return toast.add({ title: `Failed to ${id ? 'update' : 'create'} category.`, color: 'red' })
  }
}
</script>

<template>
  <div class="grid grid-cols-12 w-full">
    <div class="col-span-12 lg:col-span-4">
      <h1 class="obotoronika-text-color font-semibold text-xl">
        Add new category:
      </h1>
      <p class="obotoronika-text-color text-sm">
        Edit your category information from here
      </p>
    </div>
    <div class="col-span-12 lg:col-span-8">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="input-group">
          <UFormGroup label="Name" name="name">
            <UInput v-model="state.name" size="lg" placeholder="Category name" />
          </UFormGroup>
        </div>
        <div class="input-group">
          <UFormGroup label="Slug" name="slug">
            <UInput v-model="state.slug" size="lg" placeholder="Slug" />
          </UFormGroup>
        </div>
        <div class="input-group">
          <UFormGroup label="Parent Category" name="categories">
            <USelectMenu
              v-model="state.parent"
              :options="categories"
              value-attribute="id"
              option-attribute="name"
              placeholder="Select..."
              class="w-full"
              size="lg"
            />
          </UFormGroup>
        </div>
        <div class="input-group">
          <UFormGroup label="Thumbnail" name="image">
            <UInput
              v-model="state.image"
              type="file"
              size="lg"
              icon="i-heroicons-folder"
              @change="handleFileInputChange"
            />
          </UFormGroup>
        </div>
        <UFormGroup label="Description" name="description">
          <UTextarea
            v-model="state.description"
            variant="outline"
            placeholder="Description"
            size="xl"
          />
        </UFormGroup>
        <UButton type="submit" size="lg" class="w-auto ml-auto">
          {{ id && !isNaN(id) ? 'Update' : 'Create' }} Category
        </UButton>
      </UForm>
    </div>
  </div>
</template>
