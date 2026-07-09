<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { format } from 'date-fns'
import { colors } from '@/constants/index'
import { UBreadcrumb, UButton } from '#components'

const route = useRoute()

const links = [
  {
    label: 'Finance',
    icon: 'solar:wallet-outline',
    to: '/dashboard/products',
  },
  { label: 'Invoices', icon: 'i-heroicons-list-bullet' },
]

const id = route.params.id as string

const { data: res, pending }: any = useFetch(`/api/dashboard/finance/invoices/${id}`)

const data = res.value?.data

// const badgeColor = (status: string): string => {
//   const colorMap: Record<string, string> = {
//     unpaid: 'red',
//     paid: 'green',
//     refunded: 'gray',
//     partially_refunded: 'orange',
//     pending: 'yellow',
//     failed: 'rose',
//   }

//   return colorMap[status] || 'gray' // Default fallback color
// }
</script>

<template>
  <div>
    <div class="flex justify-between">
      <UBreadcrumb h3="Products" :links="links" />
      <div class="space-x-2">
        <UButton variant="outline" color="gray">
          Print
        </UButton>
        <UButton>Download</UButton>
      </div>
    </div>
    <CustomCard v-if="!pending" class="mt-4">
      <div class="flex justify-between">
        <div class="logo">
          <AtomsLogo :width="100" :height="60" :fill="colors.primary" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="bg-green-500/20 p-green-500 text-xs w-fit py-0.5 font-medium  text-green-500  uppercase px-2 rounded">
            {{ data?.status }}
          </span>
          <b class="obotoronika-h3 font-semibold">INV - #246098</b>
        </div>
      </div>
      <div class="mb-12 mt-8 grid gap-4 xs:grid-cols-2 sm:grid-cols-3 sm:grid-rows-1">
        <div class="">
          <h3 class="mb-3.5 font-semibold obotoronika-title">
            From
          </h3>
          <p class="mb-1.5 p-sm font-semibold uppercase obotoronika-title">
            {{ data?.merchant.name }}
          </p>
          <p class="mb-1.5  obotoronika-text">
            {{ data?.merchant?.user.metadata.name }}
          </p>
          <p class="mb-1.5 obotoronika-text">
            {{ data?.merchant?.address }}
          </p>
          <p class="mb-4 sm:mb-6 md:mb-8  obotoronika-text">
            {{ data?.merchant?.user?.phone }}
          </p>
          <div>
            <p class="mb-2 p-sm font-semibold  obotoronika-title">
              Creation Date
            </p>
            <p v-if="data?.issued_at" class="obotoronika-text">
              {{ format(data?.issued_at, 'MMMM d, yyyy, h:mm a') }}
            </p>
          </div>
        </div>

        <div class="mt-4 xs:mt-0">
          <h3 class="mb-3.5 font-semibold  obotoronika-title">
            Bill To
          </h3>
          <p class="mb-1.5 p-sm font-semibold uppercase obotoronika-title">
            {{ data?.user?.metadata?.name }}
          </p>
          <p class="mb-1.5 obotoronika-text">
            2715 Anik, <br>
            South Dakota 83475
          </p>
          <p class="mb-4 sm:mb-6 md:mb-8 obotoronika-text">
            (671) 555-0110
          </p>
          <div>
            <p class="mb-2 p-sm font-semibold obotoronika-title">
              Due Date
            </p>
            <p v-if="data?.due_date" class="obotoronika-text">
              {{ format(data?.due_date, 'MMMM d, yyyy, h:mm a') }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex sm:mt-6 md:mt-0 md:justify-end">
          <Qrcode
            value="Obotoronika Invoice"
            variant="pixelated"
            class="h-28 w-28 lg:h-32 lg:w-32"
          />
        </div>
      </div>
      <div>
        <DashboardFinanceInvoiceDetailsTable :items="data?.items ?? []" />
      </div>
      <div class="flex flex-col-reverse items-start justify-between border-t border-muted pb-4 pt-8 xs:flex-row">
        <div class="mt-6 max-w-md pe-4 xs:mt-0">
          <h3
            class="mb-1 p-xs font-semibold uppercase xs:mb-2 xs:p-sm obotoronika-title"
          >
            Notes
          </h3>
          <p class="leading-[1.7] obotoronika-text">
            We appreciate your business. Should you need us to add VAT or extra
            notes let us know!
          </p>
        </div>
        <div class="w-full max-w-sm obotoronika-text text-sm">
          <p class="flex items-center justify-between border-b border-muted pb-3.5 lg:pb-5">
            Subtotal:
            <span class="font-semibold">
              {{ data?.subtotal }}
            </span>
          </p>
          <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
            Shipping:
            <span class="font-semibold">
              {{ data?.shipping_cost }}
            </span>
          </p>
          <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
            Discount:
            <span class="font-semibold">
              0
            </span>
          </p>
          <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
            Taxes:
            <span class="font-semibold">
              15%
            </span>
          </p>
          <p class="flex items-center justify-between pt-4 p-base font-semibold p-gray-900 lg:pt-5">
            Total:
            <span>
              {{ data?.total }}
            </span>
          </p>
        </div>
      </div>
    </CustomCard>
    <SkeletonsDashboardInvoiceDetails v-else />
  </div>
</template>
