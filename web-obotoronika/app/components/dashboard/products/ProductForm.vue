<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import type { z } from './helper'
import type { FormType } from './types/formType'
import { createSchema, productFormSubmit } from './helper'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'
import { UButton, UForm, UFormGroup, UInput, URadioGroup, USelectMenu, UTextarea, UToggle } from '#components'

const props = defineProps({
  isSavingDraft: Boolean,
  isSubmitting: Boolean,
  product: Object,
})

const emit = defineEmits(['getFormData', 'getDataForDraft'])

// Fetched Data from server
// @ts-ignore
const { data } = await useFetch(`/api/dashboard/categories`)
// @ts-ignore
const { data: sections }: any = await useFetch('/api/dashboard/sections?status=active')
const fetchedCategories = (data.value as unknown as SuccessResponse) || {
  categories: [],
}

// Composable
const { role } = useAuth()

const sectionState = ref<Record<string, boolean>>({})
const slugError = ref<string | null>(null)
const preview_list = ref<any[]>([])
const preview_thumbnail = ref<any>()
const rerender = ref(1)
const state = reactive<FormType>({
  title: undefined,
  sku: undefined,
  category_id: undefined,
  description: undefined,
  thumbnail: undefined,
  files: [],
  price: undefined,
  cost_price: undefined,
  offer_price: undefined,
  // Inventory
  track_inventory: false,
  current_stock: undefined,
  low_stock_alert: undefined,
  initial_stock: undefined,
  availability: 'in_stock',
  global_trade_number: undefined,
  manufacturer_number: undefined,
  brand: undefined,
  item_upc: undefined,
  custom_fields: [{ name: '', value: '' }],
  free_shipping: false,
  shipping_price: undefined,
  locationBasedShipping: false,
  locationBasedShippingPrice: [{ name: '', value: '' }],
  availableDate: undefined,
  endDate: undefined,
  variants: [],
  tags: [],
  page_title: undefined,
  meta_keywords: [],
  meta_description: undefined,
  slug: undefined,
  product_visibility: undefined,
})

for (const category of sections?.value?.data?.sections || []) {
  sectionState.value[category.slug] = false
}

if (props.product) {
  state.title = props.product?.title
  state.sku = props.product?.sku
  state.category_id = props.product?.category_id
  state.description = props.product?.description
  state.price = props.product?.price
  state.cost_price = props.product?.cost_price
  state.offer_price = props.product?.offer_price
  state.track_inventory = props.product?.track_inventory
  state.current_stock = props.product?.current_stock
  state.low_stock_alert = props.product?.low_stock_alert
  state.initial_stock = props.product?.initial_stock
  state.availability = props.product?.availability
  state.global_trade_number = props.product?.global_trade_number
  state.manufacturer_number = props.product?.manufacturer_number
  state.brand = props.product?.brand
  state.item_upc = props.product?.item_upc
  state.free_shipping = props.product?.free_shipping
  state.shipping_price = props.product?.shipping_price
  state.locationBasedShipping = props.product?.locationBasedShipping
  state.locationBasedShippingPrice = props.product?.locationBasedShippingPrice
  state.availableDate = props.product?.availableDate
  state.endDate = props.product?.endDate
  state.variants = props.product?.variants
  state.tags = props.product?.tags
  state.page_title = props.product?.page_title
  state.meta_keywords = props.product?.meta_keywords
  state.meta_description = props.product?.meta_description
  state.slug = props.product?.slug
  state.meta_keywords = props.product?.meta_keywords
  try {
    const parsed = JSON.parse(props.product?.custom_fields || '[]')
    state.custom_fields = Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [{ name: '', value: '' }]
  }
  catch {
    state.custom_fields = [{
      name: '',
      value: '',
    }]
  }
  try {
    const parsed = JSON.parse(props.product?.locationBasedShippingPrice || '[]')
    state.locationBasedShippingPrice = Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [{ name: '', value: '' }]
  }
  catch {
    state.locationBasedShippingPrice = [{
      name: '',
      value: '',
    }]
  }
  // Load product_visibility into sectionState
  try {
    if (props.product?.product_visibility) {
      const parsedVisibility = props.product.product_visibility
      for (const key in parsedVisibility) {
        if (!Object.prototype.hasOwnProperty.call(sectionState.value, key)) {
          sectionState.value[key] = false
        }
      }
      // Then update with the actual values
      for (const key in parsedVisibility) {
        sectionState.value[key] = parsedVisibility[key] === true
      }
    }
  }
  catch {
    // If parsing fails, keep default values (all false)
  }
  // try {
  //   const parsed = JSON.parse(props.product?.meta_keywords || '[]')
  //   state.meta_keywords = Array.isArray(parsed) && parsed.length > 0
  //     ? parsed
  //     : []
  // }
  // catch {
  //   state.meta_keywords = []
  // }
}

const schema = computed(() => createSchema(!!props.product?.thumbnail))
const categories = computed(() =>
  fetchedCategories.data?.categories.map(({ id, name }: any) => ({ id, name })),
)
const fileError = computed(() => {
  const invalidFile = state.files.some(
    file => !file.type.startsWith('image/'),
  )
  return invalidFile
    ? 'All files must be images (e.g., .jpg, .jpeg, .png).'
    : ''
})

type Schema = z.output<typeof schema.value>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  for (const key in sectionState.value) {
    if (sectionState.value[key] === false) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete sectionState.value[key]
    }
  }
  const visibility = JSON.stringify(sectionState.value)
  productFormSubmit(event, { product_visibility: visibility }, { value: fileError.value }, emit)
}

async function saveAsDraft() {
  // Prepare product_visibility
  const visibilityState = { ...sectionState.value }
  for (const key in visibilityState) {
    if (visibilityState[key] === false) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete visibilityState[key]
    }
  }
  const visibility = JSON.stringify(visibilityState)

  // Prepare the state object with all form data
  const draftData = {
    ...state,
    product_visibility: visibility,
  }

  emit('getDataForDraft', draftData)
}

const handleDescription = (content: string | undefined) => {
  state.description = content
}

const previewSingleFile = (event: any) => {
  const input = event
  if (input) {
    const file = input as File[]
    const reader = new FileReader()
    reader.onload = (e: any) => {
      preview_thumbnail.value = [e.target.result]
    }
    state.thumbnail = file[0]
    reader.readAsDataURL(file[0] as any)
  }
}

const previewFiles = (event: any) => {
  const input = event
  let count = input.length
  let index = 0
  if (input) {
    while (count--) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        preview_list.value.push(e.target.result)
      }
      state.files.push(input[index])
      reader.readAsDataURL(input[index])
      index++
    }
  }
}

const handleAvailability = (text: string) => {
  state.availability = text
}

const addCustomFields = () => {
  state.custom_fields.push({
    name: '',
    value: '',
  })
}

const removeCustomFields = (index: number) => {
  state.custom_fields.splice(index, 1)
}

const addVariant = (variants: any) => {
  state.variants = variants
}
const addLocation = () => {
  state.locationBasedShippingPrice.push({
    name: '',
    value: '',
  })
}

const removeLocation = (index: number) => {
  state.locationBasedShippingPrice.splice(index, 1)
}

const handleRemoveImg = (index?: number) => {
  if (index === undefined) {
    // Remove thumbnail
    state.thumbnail = undefined
    preview_thumbnail.value = undefined
  }
  else {
    // Remove file at index (index is 1-based for files)
    const fileIndex = index - 1
    if (fileIndex >= 0 && fileIndex < state.files.length) {
      state.files.splice(fileIndex, 1)
      preview_list.value.splice(fileIndex, 1)
    }
  }
  rerender.value++
}

watch(
  () => state.title,
  (newTitle) => {
    if (newTitle) {
      state.slug = slugify(newTitle)
      state.page_title = newTitle
    }
    else {
      state.slug = undefined
    }
  },
)

watch(
  () => state.slug,
  async (newSlug) => {
    if (!newSlug) {
      slugError.value = null // Clear error if slug is empty
      return
    }

    try {
      const { data, error }: any = await useFetch(`/api/dashboard/products/has-slug`, {
        params: { slug: newSlug },
      })

      if (error.value) {
        slugError.value = 'Error validating slug. Please try again.'
        return
      }

      if (data.value?.data?.hasSlug) {
        slugError.value = 'This slug is already in use. Please choose another.'
      }
      else {
        slugError.value = null
      }
    }
    catch {
      slugError.value = 'Error validating slug. Please try again.'
    }
  },
)

// Watch for product and sections to load product_visibility
watch(
  () => [props.product?.product_visibility, sections?.value?.data?.sections],
  () => {
    if (props.product?.product_visibility && sections?.value?.data?.sections) {
      try {
        const parsedVisibility = JSON.parse(props.product.product_visibility)
        // Ensure all section slugs are initialized in sectionState
        for (const section of sections.value.data.sections) {
          if (!Object.prototype.hasOwnProperty.call(sectionState.value, section.slug)) {
            sectionState.value[section.slug] = false
          }
        }
        // Update sectionState with the parsed visibility values
        for (const key in parsedVisibility) {
          if (Object.prototype.hasOwnProperty.call(sectionState.value, key)) {
            sectionState.value[key] = parsedVisibility[key] === true
          }
        }
      }
      catch {
        // If parsing fails, keep default values (all false)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <div id="summary" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Summary
        </h3>
        <p class="desc">
          Edit your product description and necessary information from here
        </p>
      </div>
      <div class="content">
        <UFormGroup label="Title" name="title" class="mb-4">
          <UInput v-model="state.title" size="lg" placeholder="Product Title" />
        </UFormGroup>
        <div class="form-group">
          <UFormGroup label="SKU" name="sku">
            <UInput v-model="state.sku" size="lg" placeholder="Product SKU" />
          </UFormGroup>
          <UFormGroup label="Select Category" name="category_id">
            <USelectMenu
              v-model.number="state.category_id"
              :options="categories"
              value-attribute="id"
              option-attribute="name"
              placeholder="Select..."
              class="w-full"
              size="lg"
            />
          </UFormGroup>
        </div>
        <UFormGroup label="Description" name="description">
          <TextEditor
            :model="state.description"
            @update:model="handleDescription"
          />
        </UFormGroup>
      </div>
    </div>
    <div id="files" class="my-8 section">
      <div class="heading">
        <h3 class="title">
          Files
        </h3>
        <p class="desc">
          Edit your product description and necessary information from here
        </p>
      </div>
      <div class="content">
        <div :key="rerender" class="form-group">
          <UFormGroup label="Thumbnail" name="thumbnail">
            <UInput
              type="file"
              size="lg"
              icon="i-heroicons-folder"
              @change="previewSingleFile"
            />
          </UFormGroup>
          <UFormGroup label="Additional Images" name="files">
            <UInput
              type="file"
              size="lg"
              icon="i-heroicons-folder"
              :color="fileError ? 'red' : undefined"
              multiple
              @change="previewFiles"
            />
            <p
              v-if="fileError"
              class="mt-2 text-red-500 dark:text-red-400 text-sm"
            >
              {{ fileError }}
            </p>
          </UFormGroup>
        </div>
        <div
          v-if="preview_list.length || preview_thumbnail"
          class="mt-4 grid grid-cols-3 gap-4"
        >
          <div v-if="preview_thumbnail" class="preview-img">
            <img :src="preview_thumbnail" class="h-56 w-full object-cover">
            <p class="mb-0 mt-4 px-4">
              File name: {{ state.thumbnail.name }}
            </p>
            <p class="px-4 mb-2.5">
              Size: {{ state.thumbnail.size / 1024 }}KB
            </p>
            <div class="overlay">
              <svg viewBox="0 0 500 150">
                <path
                  d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
                  style="stroke: none; fill: #00000040"
                />
              </svg>
              <button type="button" @click="() => handleRemoveImg()">
                <Icon name="basil:cross-solid" :size="32" />
              </button>
            </div>
          </div>
          <div
            v-for="(item, index) in preview_list"
            :key="index"
            class="preview-img"
          >
            <img :src="item" class="h-56 w-full object-cover">
            <p class="mb-0 mt-4 px-4">
              File name: {{ state.files[index].name }}
            </p>
            <p class="px-4 mb-2.5">
              Size: {{ state.files[index].size / 1024 }}KB
            </p>
            <div class="overlay">
              <svg viewBox="0 0 500 150">
                <path
                  d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
                  style="stroke: none; fill: #00000040"
                />
              </svg>
              <button type="button" @click="() => handleRemoveImg(index + 1)">
                <Icon name="basil:cross-solid" :size="32" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="group-section">
      <div class="section">
        <div class="heading">
          <h3 class="title">
            Pricing
          </h3>
          <p class="desc">
            Edit your product description and necessary information from here
          </p>
        </div>
        <div class="content">
          <div class="form-group">
            <UFormGroup label="Price" name="price">
              <UInput
                v-model="state.price"
                size="lg"
                placeholder="Price"
                type="number"
              />
            </UFormGroup>
            <UFormGroup label="Cost Price" name="cost_price">
              <UInput
                v-model="state.cost_price"
                size="lg"
                placeholder="Cost price"
                type="number"
              />
            </UFormGroup>
          </div>
          <div class="form-group">
            <UFormGroup label="Offer Price" name="offer_price">
              <UInput
                v-model="state.offer_price"
                size="lg"
                placeholder="Retail price"
                type="number"
              />
            </UFormGroup>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="heading">
          <h3 class="title">
            Inventory Tracking
          </h3>
          <p class="desc">
            Add your product inventory info here
          </p>
        </div>
        <div class="content">
          <UFormGroup class="mb-4">
            <URadioGroup
              v-model="state.track_inventory"
              :options="[
                { value: true, label: 'Track inventory for this product' },
                {
                  value: false,
                  label: 'Do not track inventory for this product',
                },
              ]"
            />
          </UFormGroup>
          <div class="form-group">
            <UFormGroup label="Current Stock Level" name="current_stock">
              <UInput
                v-model="state.current_stock"
                size="lg"
                placeholder="150"
                type="number"
              />
            </UFormGroup>
            <UFormGroup label="Low Stock Level" name="low_stock_alert">
              <UInput
                v-model="state.low_stock_alert"
                size="lg"
                placeholder="20"
                type="number"
              />
            </UFormGroup>
            <UFormGroup label="Initial Stock Level" name="initial_stock">
              <UInput
                v-model="state.initial_stock"
                size="lg"
                placeholder="20"
                type="number"
              />
            </UFormGroup>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="heading">
          <h3 class="title">
            Availability
          </h3>
          <p class="desc">
            Add your product inventory info here
          </p>
        </div>
        <div class="content">
          <div class="form-group availability">
            <button
              :class="`${state.availability === 'in_stock' ? 'active' : ''}`"
              type="button"
              @click="handleAvailability('in_stock')"
            >
              In Stock
            </button>
            <button
              :class="`${state.availability === 'coming_soon' ? 'active' : ''}`"
              type="button"
              @click="handleAvailability('coming_soon')"
            >
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
    <div id="product-identifiers" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Product Identifiers
        </h3>
        <p class="desc">
          Edit your product identifiers here
        </p>
      </div>
      <div class="content">
        <div class="form-group">
          <UFormGroup
            label="Global Trade Item Number"
            name="global_trade_number"
            class="mb-4"
          >
            <UInput
              v-model="state.global_trade_number"
              size="lg"
              placeholder="12345"
            />
          </UFormGroup>
          <UFormGroup
            label="Manufacturer Part Number"
            name="manufacturer_number"
            class="mb-4"
          >
            <UInput
              v-model="state.manufacturer_number"
              size="lg"
              placeholder="145782"
            />
          </UFormGroup>
        </div>
        <div class="form-group">
          <UFormGroup label="Brand Name" name="brand" class="mb-4">
            <UInput v-model="state.brand" size="lg" placeholder="Brand name" />
          </UFormGroup>
          <UFormGroup label="Product UPC/EAN" name="item_upc" class="mb-4">
            <UInput v-model="state.item_upc" size="lg" placeholder="12345" />
          </UFormGroup>
        </div>
        <div
          v-for="(item, index) in state.custom_fields"
          :key="index"
          class="flex gap-2 w-full items-center"
        >
          <div class="form-group w-full grid-cols-2">
            <UFormGroup
              label="Custom Field Name"
              name="custom_fields"
              class="lg:mb-4"
            >
              <UInput
                v-if="state.custom_fields?.[index]"
                v-model="state.custom_fields[index].name"
                size="lg"
                placeholder="Custom field name"
              />
            </UFormGroup>
            <UFormGroup
              label="Custom Field Value"
              name="custom_fields"
              class="lg:mb-4"
            >
              <UInput
                v-if="state.custom_fields[index]"
                v-model="state.custom_fields[index].value"
                size="lg"
                placeholder="Custom field value"
              />
            </UFormGroup>
          </div>
          <UButton
            v-if="index > 0"
            icon="i-heroicons-trash"
            size="sm"
            class="mb-2 lg:mb-0"
            color="red"
            square
            variant="solid"
            @click="removeCustomFields(index)"
          />
        </div>
        <UButton
          label="Add item"
          size="lg"
          icon="i-heroicons-plus"
          block
          class="w-40 h-fit"
          color="black"
          @click="addCustomFields"
        />
      </div>
    </div>
    <div id="shipping" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Shipping
        </h3>
        <p class="desc">
          Add your shipping info here
        </p>
      </div>
      <div class="content">
        <div class="flex gap-2 items-center mb-8">
          <UToggle
            v-model="state.free_shipping"
            on-icon="i-heroicons-check-20-solid"
            off-icon="i-heroicons-x-mark-20-solid"
            size="lg"
            name="free_shipping"
          />
          <label for="free_shipping">Free Shipping</label>
        </div>
        <UFormGroup label="Shipping Price" name="shipping_price" class="mb-4">
          <UInput
            v-model="state.shipping_price"
            size="lg"
            placeholder="150.00"
            type="number"
            :disabled="state.free_shipping"
          />
        </UFormGroup>
        <div class="flex gap-2 items-center my-8">
          <UToggle
            v-model="state.locationBasedShipping"
            on-icon="i-heroicons-check-20-solid"
            off-icon="i-heroicons-x-mark-20-solid"
            size="lg"
          />
          <label for="free_shipping">Location Based Shipping</label>
        </div>
        <div
          v-for="(item, index) in state.locationBasedShippingPrice"
          :key="index"
          class="flex gap-2 w-full items-center"
        >
          <div class="form-group w-full grid-cols-2">
            <UFormGroup
              label="Location Name"
              name="locationBasedShippingPrice"
              class="mb-4"
            >
              <UInput
                v-if="state.locationBasedShippingPrice[index]"
                v-model="state.locationBasedShippingPrice[index].name"
                size="lg"
                placeholder="Location name"
              />
            </UFormGroup>
            <UFormGroup
              label="Shipping Charge"
              name="locationBasedShippingPrice"
              class="mb-4"
            >
              <UInput
                v-if="state.locationBasedShippingPrice[index]"
                v-model="state.locationBasedShippingPrice[index].value"
                size="lg"
                placeholder="150.00"
              />
            </UFormGroup>
          </div>
          <UButton
            v-if="index > 0"
            icon="i-heroicons-trash"
            size="sm"
            color="red"
            square
            variant="solid"
            @click="removeLocation(index)"
          />
        </div>
        <UButton
          label="Add item"
          size="lg"
          icon="i-heroicons-plus"
          block
          class="w-40 h-fit"
          color="black"
          @click="addLocation"
        />
      </div>
    </div>
    <div id="delivery-date" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Delivery / Event Date
        </h3>
        <p class="desc">
          Add delivery or vent Date here
        </p>
      </div>
      <div class="content">
        <div class="form-group">
          <UFormGroup label="Available date" name="availableDate" class="mb-4">
            <UInput
              v-model="state.availableDate"
              size="lg"
              placeholder="Available Date"
            />
          </UFormGroup>
          <UFormGroup label="End date" name="endDate" class="mb-4">
            <UInput v-model="state.endDate" size="lg" placeholder="End Date" />
          </UFormGroup>
        </div>
      </div>
    </div>
    <div id="variant-options" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Variants
        </h3>
        <p class="desc">
          Add your product variants here
        </p>
      </div>
      <div class="content">
        <DashboardProductsVariants :items="state.variants" @get-variants="addVariant" />
      </div>
    </div>
    <div id="tags" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Product Tags
        </h3>
        <p class="desc">
          Add your product's tag or category here
        </p>
      </div>
      <div class="content">
        <UFormGroup label="Add Tags" name="tags" class="mb-4">
          <TagsInput v-model="state.tags">
            <TagsInputItem v-for="item in state.tags" :key="item" :value="item">
              <TagsInputItemText />
              <TagsInputItemDelete />
            </TagsInputItem>
            <TagsInputInput placeholder="Tags..." />
          </TagsInput>
        </UFormGroup>
      </div>
    </div>
    <div id="seo" class="section my-12">
      <div class="heading">
        <h3 class="title">
          Search Engine Optimization
        </h3>
        <p class="desc">
          Add your product's seo info here
        </p>
      </div>
      <div class="content">
        <div class="form-group">
          <UFormGroup label="Page Title" name="page_title" class="mb-4">
            <UInput
              v-model="state.page_title"
              size="lg"
              placeholder="Page title"
            />
          </UFormGroup>
          <UFormGroup label="Meta Keywords" name="meta_keywords" class="mb-4">
            <TagsInput v-model="state.meta_keywords">
              <TagsInputItem
                v-for="item in state.meta_keywords"
                :key="item"
                :value="item"
              >
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="Keywords..." />
            </TagsInput>
          </UFormGroup>
        </div>
        <div class="form-group">
          <UFormGroup
            label="Meta Description"
            name="meta_description"
            class="mb-4"
          >
            <UInput
              v-model="state.meta_description"
              size="lg"
              placeholder="Description"
            />
          </UFormGroup>
          <UFormGroup label="Slug" name="slug" class="mb-4">
            <UInput
              v-model="state.slug"
              size="lg"
              placeholder="Slug"
              :color="slugError ? 'red' : undefined"
            />
            <p v-if="slugError" class="mt-2 text-red-500 dark:text-red-400 text-sm">
              {{ slugError }}
            </p>
          </UFormGroup>
        </div>
      </div>
    </div>
    <div id="product_visibility" class="section mt-12 mb-6 !border-b-0">
      <div class="heading">
        <h3 class="title">
          Product Visibility
        </h3>
        <p class="desc">
          Control where and how this product appears.
        </p>
      </div>
      <div class="content">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="section in sections?.data?.sections ?? []" :key="section.id" class="flex gap-2 items-center my-8">
            <UToggle
              v-model="sectionState[section.slug]"
              on-icon="i-heroicons-check-20-solid"
              off-icon="i-heroicons-x-mark-20-solid"
              size="lg"
            />
            <label for="free_shipping">Mark as <b class="font-semibold">{{ section.title }}</b></label>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="flex gap-2">
        <UButton
          type="button"
          label="Save as Draft"
          size="lg"
          color="white"
          :loading="props.isSavingDraft"
          @click="saveAsDraft"
        />
        <UButton
          type="submit"
          :label="['super_admin', 'admin', 'manager'].includes(role ?? '') ? 'Publish' : 'Submit for Review'"
          size="lg"
          :loading="props.isSubmitting"
        />
      </div>
    </div>
  </UForm>
</template>

<style scoped>
@import url("./styles/index.css");
</style>
