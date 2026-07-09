<script lang="ts" setup>
import { Search, X } from 'lucide-vue-next'
import { onKeyStroke, useDebounceFn } from '@vueuse/core'
import { UInput, UIcon } from '#components'

interface SearchProduct {
  id: string
  title: string
  slug: string
  thumbnail: string
}

const isOpen = ref(false)
const query = ref('')
const suggestions = ref<SearchProduct[]>([])
const isLoading = ref(false)
const searchInputRef = ref<{ $el?: HTMLElement } | null>(null)

useCustomBodyScrollLock(isOpen)

const config = useRuntimeConfig()

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
  closeSearch()
}

function closeSearch() {
  isOpen.value = false
  query.value = ''
  suggestions.value = []
}

function thumbnailUrl(thumb: string) {
  return config.public.mediaUrl ? `${config.public.mediaUrl}${thumb}` : thumb
}

watch(isOpen, (open) => {
  if (open) {
    query.value = ''
    suggestions.value = []
    nextTick(() => searchInputRef.value?.$el?.querySelector('input')?.focus())
  }
})

onKeyStroke('Escape', () => {
  if (isOpen.value) closeSearch()
})
</script>

<template>
  <div>
    <button class="btn-3" @click="isOpen = true">
      <Search :size="20" />
      <span class="hidden lg:inline">Search</span>
    </button>
    <div :class="{ active: isOpen }" class="search-overlay">
      <div class="search-overlay-inner">
        <UInput
          ref="searchInputRef"
          v-model="query"
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          color="white"
          :trailing="false"
          placeholder="Search products..."
          class="w-full"
          autocomplete="off"
          @input="onQueryInput"
        />
        <!-- Auto-suggest dropdown -->
        <div
          v-if="query.trim()"
          class="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,400px)] overflow-y-auto rounded-lg border border-white/10 bg-white/95 shadow-xl backdrop-blur dark:bg-gray-900/95"
        >
          <div v-if="isLoading" class="flex items-center justify-center gap-2 px-4 py-6 text-gray-500">
            <UIcon name="i-heroicons-arrow-path" class="h-5 w-5 animate-spin" />
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
              <span class="line-clamp-2 text-gray-800 dark:text-gray-200">{{ product.title }}</span>
            </NuxtLink>
            <p
              v-if="!isLoading && suggestions.length === 0"
              class="px-4 py-6 text-center text-gray-500"
            >
              No products found for "{{ query }}"
            </p>
          </template>
        </div>
      </div>
      <button
        type="button"
        class="btn-3 search-close-btn"
        aria-label="Close search"
        @click="closeSearch"
      >
        <X />
      </button>
    </div>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto backdrop-blur-sm h-screen"
      @click="closeSearch"
    />
  </div>
</template>
