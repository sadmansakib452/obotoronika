<script lang="ts" setup>
interface IProps {
  items: []
}
const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
})
</script>

<template>
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">
            Item
          </th>
          <th scope="col" class="px-6 py-3">
            Quantity
          </th>
          <th scope="col" class="px-6 py-3">
            Unit Price
          </th>
          <th scope="col" class="px-6 py-3">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in props.items" :key="index" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
          <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ item.product_name }}
          </th>
          <td class="px-6 py-4">
            {{ item.quantity }}
          </td>
          <td class="px-6 py-4">
            {{ item.price }}
          </td>
          <td class="px-6 py-4">
            {{ item.total }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
