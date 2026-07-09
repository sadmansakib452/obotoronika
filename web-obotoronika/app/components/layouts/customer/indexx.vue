<script lang="ts" setup>
import { CircleSlash, CreditCard, Heart, NotebookTabs, ShoppingCart, Undo2, User } from 'lucide-vue-next'
</script>

<template>
  <div class="col-span-3 hidden lg:block">
    <nav>
      <ul>
        <li>
          <NuxtLink to="/user/profile">
            <User class="inline-block" :size="18" />
            Profile
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/user/address">
            <NotebookTabs class="inline-block" :size="18" />
            My Addresses
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/user/payment-options">
            <CreditCard class="inline-block" :size="18" />
            Payment Options
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <nav>
      <ul>
        <li>
          <NuxtLink to="/user/wishlist">
            <Heart class="inline-block" :size="18" />
            Wishlist
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="">
            <Undo2 class="inline-block" :size="18" />
            Returns
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="">
            <CircleSlash class="inline-block" :size="18" />
            Cancellations
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
nav {
    @apply text-sm border-b py-2.5;

    a {
        @apply rounded-md px-2 py-1.5 flex items-center gap-1 hover:bg-gray-100 text-xs font-semibold obotoronika-text;

        &.router-link-exact-active {
            @apply bg-gray-200 relative hover:bg-gray-100;

            &::before {
                @apply content-[''] absolute -left-2 top-0 w-[4px] h-[70%] bg-primary rounded-md mt-[4px];
            }
        }
    }

    &:last-child {
        @apply border-b-0;
    }
}
</style>
