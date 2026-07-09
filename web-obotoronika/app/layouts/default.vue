<script lang="ts" setup>
import { colors } from '@/constants/index'
import Layout from '@/components/layouts/default/index.vue'

const { isSticky } = useIsSticky()
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
      <header v-if="showCustomerLayout" class="lg:hidden">
        <div :class="['header-top', { 'is-sticky': isSticky }]">
          <LayoutsDefaultMenu />
          <NuxtLink to="/">
            <AtomsLogo
              :width="100"
              :height="80"
              :fill="colors.primary"
              class="-my-6 hidden lg:block"
            />
            <AtomsLogo
              :width="80"
              :height="60"
              :fill="colors.primary"
              class="-my-6 block lg:hidden mx-auto"
            />
          </NuxtLink>
          <LayoutsDefaultMobile />
        </div>
      </header>

      <slot />
    </div>
  </Layout>
</template>
