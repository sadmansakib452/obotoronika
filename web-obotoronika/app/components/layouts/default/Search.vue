<script lang="ts" setup>
import { Search, X } from 'lucide-vue-next'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import { UInput } from '#components'

interface SearchProduct {
  id: string
  title: string
  slug: string
  thumbnail: string
}

const query = ref('')
const suggestions = ref<SearchProduct[]>([])
const isLoading = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

const config = useRuntimeConfig()

// Desktop: dropdown open state
const isDropdownOpen = computed(() => query.value.trim().length > 0)

// Mobile: overlay state
const isMobileOpen = ref(false)

onClickOutside(wrapperRef, () => {
  closeDropdown()
})

const fetchSuggestions = useDebounceFn(async () => {
  const q = query.value.trim()
  if (!q) {
    suggestions.value = []
    return
  }
  isLoading.value = true
  try {
    const res = await $fetch<{ data: { products: SearchProduct[] } }>('/api/products/search', {
      query: { q, limit: '8' },
    })
    suggestions.value = res?.data?.products ?? []
  }
  catch {
    suggestions.value = []
  }
  finally {
    isLoading.value = false
  }
}, 300)

function onQueryInput() {
  fetchSuggestions()
}

function goToProduct(slug: string) {
  navigateTo(`/products/${slug}`)
  closeDropdown()
  closeMobile()
}

function closeDropdown() {
  query.value = ''
  suggestions.value = []
}

function openMobile() {
  isMobileOpen.value = true
  nextTick(() => {
    const input = wrapperRef.value?.querySelector('.search-mobile-input') as HTMLInputElement | null
    input?.focus()
  })
}

function closeMobile() {
  isMobileOpen.value = false
  query.value = ''
  suggestions.value = []
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeDropdown()
    closeMobile()
  }
}

function thumbnailUrl(thumb: string) {
  return config.public.mediaUrl ? `${config.public.mediaUrl}${thumb}` : thumb
}

onUnmounted(() => {
  closeMobile()
})
</script>

<template>
  <div ref="wrapperRef" class="search-wrapper">
    <!-- Desktop: inline search bar — just type, no overlay -->
    <div class="search-bar hidden lg:flex">
      <Search :size="20" class="search-bar-icon" />
      <input
        ref="searchInputRef"
        v-model="query"
        type="text"
        placeholder="Search products..."
        autocomplete="off"
        class="search-bar-input"
        @input="onQueryInput"
        @keydown="handleKeydown"
      >
      <button
        v-if="query"
        type="button"
        class="search-clear-btn"
        aria-label="Clear search"
        @click="query = ''; suggestions = []"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Mobile: search icon trigger -->
    <button class="search-mobile-trigger lg:hidden" aria-label="Search" @click="openMobile">
      <Search :size="20" />
    </button>

    <!-- Mobile: full-screen search overlay -->
    <teleport to="body">
      <div v-if="isMobileOpen" class="search-mobile-overlay">
        <div class="search-mobile-header">
          <button type="button" class="search-mobile-close" aria-label="Close search" @click="closeMobile">
            <X :size="20" />
          </button>
          <div class="search-mobile-input-wrap">
            <Search :size="18" class="search-mobile-input-icon" />
            <input
              v-model="query"
              type="text"
              placeholder="Search products..."
              autocomplete="off"
              class="search-mobile-input"
              autofocus
              @input="onQueryInput"
              @keydown="handleKeydown"
            >
          </div>
        </div>

        <!-- Suggestions -->
        <div v-if="query.trim()" class="search-mobile-results">
          <div v-if="isLoading" class="flex items-center justify-center gap-2 px-4 py-6 text-gray-500">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            <span>Searching...</span>
          </div>
          <template v-else>
            <NuxtLink
              v-for="product in suggestions"
              :key="product.id"
              :to="`/products/${product.slug}`"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              @click.prevent="goToProduct(product.slug)"
            >
              <img
                :src="thumbnailUrl(product.thumbnail)"
                :alt="product.title"
                class="h-12 w-12 shrink-0 rounded object-cover"
              >
              <span class="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">{{ product.title }}</span>
            </NuxtLink>
            <p
              v-if="!isLoading && suggestions.length === 0"
              class="px-4 py-6 text-center text-sm text-gray-500"
            >
              No products found for "{{ query }}"
            </p>
          </template>
        </div>
      </div>
    </teleport>

    <!-- Desktop: auto-suggest dropdown (no overlay, just dropdown below input) -->
    <div v-if="isDropdownOpen" class="search-dropdown hidden lg:block">
      <div v-if="isLoading" class="flex items-center justify-center gap-2 px-4 py-6 text-gray-500">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <span>Searching...</span>
      </div>
      <template v-else>
        <NuxtLink
          v-for="product in suggestions"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          @click.prevent="goToProduct(product.slug)"
        >
          <img
            :src="thumbnailUrl(product.thumbnail)"
            :alt="product.title"
            class="h-12 w-12 shrink-0 rounded object-cover"
          >
          <span class="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">{{ product.title }}</span>
        </NuxtLink>
        <p
          v-if="!isLoading && suggestions.length === 0"
          class="px-4 py-6 text-center text-sm text-gray-500"
        >
          No products found for "{{ query }}"
        </p>
      </template>
    </div>
  </div>
</template>
