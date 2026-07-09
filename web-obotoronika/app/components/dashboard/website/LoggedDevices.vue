<script setup lang="ts">
import { format } from 'date-fns'
import { UButton, UDropdown } from '#components'

const { getSessions, sessions } = useAuthStore()

const items = (id: string) => [
  [{
    label: 'Logout',
    icon: 'lucide:log-out',
    click: async () => {
      await useFetch(`/api/auth/sessions/${id}`, { method: 'delete' })
      await getSessions()
    },
  }],
]

onMounted(async () => {
  await getSessions()
})
</script>

<template>
  <div class="mx-auto w-full max-w-screen-2xl">
    <div class="mb-4">
      <h3 class="font-Homenaje text-3xl obotoronika-title">
        Where you're logged in
      </h3>
      <p class="obotoronika-muted-text text-sm">
        We'll alert you via <span class="font-medium">olivia@untitledui.com</span> if there is any unusual
        activity on your account.
      </p>
    </div>

    <!-- First device -->
    <div
      v-for="(item, index) in sessions.data"
      :key="item.id"
      :class="[
        'flex items-center gap-6 py-6 justify-between',
        index !== sessions.data.length - 1 ? 'border-b border-dashed obotoronika-border-color' : '',
      ]"
    >
      <div class="flex items-center gap-6">
        <Icon name="heroicons-computer-desktop" class="text-4xl" />
        <div>
          <div class="mb-2 flex items-center gap-2">
            <h3 class="text-base font-medium obotoronika-title">
              {{ item.device.includes('Unknown') ? 'Unknown' : item.device }}
            </h3>
            <span>{{ item.browser }}</span>
            <span
              v-if="item.current"
              class="relative hidden rounded-md border obotoronika-border-color py-1.5 pe-2.5 ps-5 text-xs font-semibold  before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green-500 sm:block obotoronika-title"
            >
              This Device
            </span>
          </div>
          <div class="flex items-center gap-2">
            <p class="text-sm obotoronika-text">
              {{ item.ip }}
            </p>
            <span class="h-1 w-1 rounded-full bg-gray-600" />
            <p class="text-sm obotoronika-text">
              {{ format(item.last_active, "dd MMM 'at' h:mmaaa") }}
            </p>
          </div>
          <span
            v-if="item.current"
            class="relative mt-2 inline-block rounded-md border border-muted py-1.5 pe-2.5 ps-5 text-xs font-semibold text-gray-900 before:absolute before:start-2.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green-500 sm:hidden"
          >
            This Device
          </span>
        </div>
      </div>
      <div>
        <UDropdown :items="items(item.id)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
    </div>
  </div>
</template>
