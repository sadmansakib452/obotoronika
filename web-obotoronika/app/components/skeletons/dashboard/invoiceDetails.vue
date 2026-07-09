<script lang="ts" setup>
import { USkeleton } from '#components'
</script>

<template>
  <CustomCard class="mt-4">
    <div class="flex justify-between">
      <div class="logo">
        <USkeleton class="h-[60px] w-[100px]" />
      </div>
      <div class="flex flex-col gap-1">
        <USkeleton class="h-4 w-20" />
        <USkeleton class="h-4 w-32" />
      </div>
    </div>
    <div class="mb-12 mt-8 grid gap-4 xs:grid-cols-2 sm:grid-cols-3 sm:grid-rows-1">
      <div class="">
        <h3 class="mb-3.5 font-semibold obotoronika-title">
          <USkeleton class="h-4 w-20" />
        </h3>
        <p class="mb-1.5 p-sm font-semibold uppercase obotoronika-title">
          <USkeleton class="h-3 w-20" />
        </p>
        <p class="mb-1.5">
          <USkeleton class="h-3 w-20" />
        </p>
        <p class="mb-1.5">
          <USkeleton class="h-3 w-20" />
        </p>
        <p class="mb-4 sm:mb-6 md:mb-8">
          <USkeleton class="h-3 w-20" />
        </p>
        <div>
          <p class="mb-2 p-sm font-semibold  obotoronika-title">
            <USkeleton class="h-3 w-20" />
          </p>
          <p class="">
            <USkeleton class="h-3 w-20" />
          </p>
        </div>
      </div>

      <div class="mt-4 xs:mt-0">
        <h3 class="mb-3.5 font-semibold  obotoronika-title">
          <USkeleton class="h-4 w-20" />
        </h3>
        <p class="mb-1.5 p-sm font-semibold uppercase obotoronika-title">
          <!-- {{ data.user.metadata.name }} -->
        </p>
        <p class="mb-1.5 obotoronika-text">
          <USkeleton class="h-3 w-20" />
        </p>
        <p class="mb-4 sm:mb-6 md:mb-8 obotoronika-text">
          <USkeleton class="h-3 w-20" />
        </p>
        <div>
          <p class="mb-2 p-sm font-semibold obotoronika-title">
            <USkeleton class="h-3 w-20" />
          </p>
          <p class="obotoronika-text">
            <USkeleton class="h-3 w-20" />
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
      <!-- <DashboardFinanceInvoiceDetailsTable /> -->
    </div>
    <div class="flex flex-col-reverse items-start justify-between border-t border-muted pb-4 pt-8 xs:flex-row">
      <div class="mt-6 max-w-md pe-4 xs:mt-0">
        <h3
          class="mb-1 p-xs font-semibold uppercase xs:mb-2 xs:p-sm obotoronika-title"
        >
          Notes
        </h3>
        <p class="leading-[1.7] obotoronika-text">
          <USkeleton class="h-3 w-32" />
          <USkeleton class="h-3 w-32" />
        </p>
      </div>
      <div class="w-full max-w-sm obotoronika-text text-sm">
        <p class="flex items-center justify-between border-b border-muted pb-3.5 lg:pb-5">
          Subtotal:
          <span class="">
            <USkeleton class="h-3 w-6" />
          </span>
        </p>
        <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
          Shipping:
          <span class="">
            <USkeleton class="h-3 w-5" />
          </span>
        </p>
        <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
          Discount:
          <span class="">
            <USkeleton class="h-3 w-5" />
          </span>
        </p>
        <p class="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
          Taxes:
          <span class="font-semibold">
            <USkeleton class="h-3 w-5" />
          </span>
        </p>
        <p class="flex items-center justify-between pt-4 p-base font-semibold p-gray-900 lg:pt-5">
          Total:
          <span>
            <USkeleton class="h-3 w-7" />
          </span>
        </p>
      </div>
    </div>
  </CustomCard>
</template>
