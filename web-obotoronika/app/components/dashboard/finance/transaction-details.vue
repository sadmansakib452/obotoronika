<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
import { format, parseISO } from 'date-fns'

interface IProps {
  id?: string | null
}
const props = withDefaults(defineProps<IProps>(), {
  id: null,
})

// @ts-ignore
const { data: res, pending }: any = useFetch(`/api/dashboard/finance/transactions/${props.id}`)
const data = computed(() => res.value?.data?.[0])
</script>

<template>
  <div>
    <div v-if="!pending" class="mt-4 space-y-2">
      <div class="">
        <b class="font-medium text-sm obotoronika-title">Date:</b>
        <p class="obotoronika-text text-sm">
          {{
            format(
              parseISO(data?.order_date),
              "MMM d, yyyy, h.mm aaa",
            ).toUpperCase()
          }}
        </p>
      </div>
      <div class="">
        <b class="font-medium text-sm obotoronika-title">Name:</b>
        <p class="obotoronika-text text-sm">
          {{ data?.customer?.name }}
        </p>
      </div>
      <div class="">
        <b class="font-medium text-sm obotoronika-title">Email:</b>
        <p class="obotoronika-text text-sm">
          {{ data?.customer?.email ?? 'N/A' }}
        </p>
      </div>
      <div class="">
        <b class="font-medium text-sm obotoronika-title">Phone:</b>
        <p class="obotoronika-text text-sm">
          {{ data?.customer?.phone ?? 'N/A' }}
        </p>
      </div>
      <div>
        <b class="font-medium text-sm obotoronika-title">Billing Address:</b>
        <p class="obotoronika-text text-sm">
          N/A
        </p>
      </div>
      <div>
        <b class="font-medium text-sm obotoronika-title">Item Purchased:</b>
        <a
          v-for="item in data?.line_items ?? []"
          :key="item.product_id"
          :href="`/${item.product_id}`"
          class="text-sm block text-primary"
          target="_blank"
        >
          {{ item.product_name }}
        </a>
      </div>
      <div>
        <b class="font-medium text-sm obotoronika-title">Payment:</b>
        <p class="obotoronika-text text-sm">
          {{ data?.merchant_earning }} Tk
        </p>
      </div>
    </div>
    <SkeletonsDashboardTransactionDetails v-else />
  </div>
</template>
