<script lang="ts" setup>
import { siteSettingsGeneraleSchema } from '@@/shared/validators/req-validators'
import { UButton, UForm, UFormGroup, UInput, USelectMenu, UTextarea } from '#components'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'

// @ts-ignore
setPageLayout('dashboard-website-settings-navigator')
useHead({
  title: 'General Settings | Obotoronika',
})

const { data }: any = await useFetch(`/api/dashboard/settings/website/general`)

const languages = [
  {
    id: 'lang_abc',
    name: 'English',
  },
]
const currencies = [
  {
    id: 'curr_abc',
    name: 'USD',
  },
]
const timezones = [
  {
    id: 'tz_abc',
    name: 'BDT',
  },
]

const schema = siteSettingsGeneraleSchema

type Schema = typeof schema
const state = reactive({
  site_name: undefined as string | undefined,
  favicon: undefined as string | undefined,
  logo: undefined as string | undefined,
  dark_logo: undefined as string | undefined,
  description: undefined as string | undefined,
  language: undefined as string | undefined,
  currency: undefined as string | undefined,
  timezone: undefined as string | undefined,
  email: undefined as string | undefined,
  phone: undefined as string | undefined,
  address: undefined as string | undefined,
})

if (data.value) {
  const response = data.value?.data
  state.site_name = response.site_name
  state.description = response.description
  state.language = response.language
  state.currency = response.currency
  state.timezone = response.timezone
  state.email = response.email
  state.phone = response.phone
  state.address = response.address
}

const handleFileInputChange = (e: any, type: 'favicon' | 'logo' | 'dark_logo') => {
  const file = e[0]
  if (!file) return

  const fileReader = new FileReader()
  fileReader.onload = function () {
    const result = fileReader.result as string
    if (type === 'favicon') state.favicon = result
    else if (type === 'logo') state.logo = result
    else if (type === 'dark_logo') state.dark_logo = result
  }
  fileReader.readAsDataURL(file)
}

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  fetch('/api/dashboard/settings/website/general', { method: 'POST', body: JSON.stringify(event.data) })
}
</script>

<template>
  <CustomCard>
    <div class="mb-4">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        General Settings
      </h3>
      <p class="obotoronika-muted-text text-sm">
        Set your store's name, logo, contact info, and basic preferences.
      </p>
    </div>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleUpdate"
    >
      <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
        <UFormGroup
          label="Site Name"
          name="site_name"
          size="lg"
          class="w-full"
        >
          <UInput v-model="state.site_name" placeholder="Site Name" />
        </UFormGroup>
        <UFormGroup label="Favicon" name="favicon" class="w-full">
          <UInput
            type="file"
            size="lg"
            icon="i-heroicons-photo"
            @change="(e) => handleFileInputChange(e, 'favicon')"
          />
        </UFormGroup>
      </div>
      <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
        <UFormGroup label="Logo" name="logo" class="w-full">
          <UInput
            type="file"
            size="lg"
            icon="i-heroicons-photo"
            @change="(e) => handleFileInputChange(e, 'logo')"
          />
        </UFormGroup>
        <UFormGroup label="Logo (Dark)" name="dark_logo" class="w-full">
          <UInput
            type="file"
            size="lg"
            icon="i-heroicons-photo"
            @change="(e) => handleFileInputChange(e, 'logo_dark')"
          />
        </UFormGroup>
      </div>
      <UFormGroup label="Short Description" name="description" class="mb-8">
        <UTextarea v-model="state.description" placeholder="Short Description" />
      </UFormGroup>
      <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
        <UFormGroup label="Select Language" name="language" class="w-full">
          <USelectMenu
            v-model.number="state.language"
            :options="languages"
            value-attribute="id"
            option-attribute="name"
            placeholder="Select..."
            class="w-full"
            size="lg"
          />
        </UFormGroup>
        <UFormGroup label="Select Currency" name="language" class="w-full">
          <USelectMenu
            v-model.number="state.currency"
            :options="currencies"
            value-attribute="id"
            option-attribute="name"
            placeholder="Select..."
            class="w-full"
            size="lg"
          />
        </UFormGroup>
      </div>
      <UFormGroup label="Select Timezone" name="timezone" class="w-full">
        <USelectMenu
          v-model.number="state.timezone"
          :options="timezones"
          value-attribute="id"
          option-attribute="name"
          placeholder="Select..."
          class="w-full"
          size="lg"
        />
      </UFormGroup>
      <div class="flex gap-4 w-full mb-8 flex-col lg:flex-row">
        <UFormGroup
          label="Email"
          name="email"
          size="lg"
          class="w-full"
        >
          <UInput v-model="state.email" placeholder="Email" />
        </UFormGroup>
        <UFormGroup
          label="Phone"
          name="phone"
          size="lg"
          class="w-full"
        >
          <UInput v-model="state.phone" placeholder="Phone" />
        </UFormGroup>
      </div>
      <UFormGroup
        label="Store Address"
        name="address"
        size="lg"
        class="w-full mb-8"
      >
        <UInput v-model="state.address" placeholder="Store Address" />
      </UFormGroup>
      <UButton
        type="submit"
        size="lg"
        block
        class="w-fit ml-auto"
      >
        Save Changes
      </UButton>
    </UForm>
  </CustomCard>
</template>
