<script lang="ts" setup>
import Layout from '@/components/layouts/default/index.vue'

const route = useRoute()

const showCustomerLayout = computed(() =>
  ['/user', '/orders', '/reviews'].some(p =>
    route.path.startsWith(p),
  ),
)
</script>

<template>
  <Layout>
    <div :class="showCustomerLayout ? 'lg:flex gap-4' : ''">
      <LayoutsCustomer v-if="showCustomerLayout" />
      <slot />
    </div>
  </Layout>
</template>
