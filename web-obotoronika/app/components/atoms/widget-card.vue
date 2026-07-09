<script lang="ts" setup>
defineProps({
  title: {
    type: [String, Object],
    required: true,
  },
  description: {
    type: [String, Object],
    default: null,
  },
  action: {
    type: [String, Object],
    default: null,
  },
  headerClassName: {
    type: String,
    default: '',
  },
  titleClassName: {
    type: String,
    default: '',
  },
  actionClassName: {
    type: String,
    default: '',
  },
  descriptionClassName: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div :class="`border obotoronika-border-color bg-gray-0 p-5 bg-white dark:bg-dark lg:p-7 rounded-lg ${className}`">
    <div
      :class="`${action ? 'flex items-start justify-between' : ''
      } ${headerClassName}`"
    >
      <div>
        <h3 :class="`text-base font-semibold sm:text-lg ${titleClassName}`">
          <slot name="title">
            {{ title }}
          </slot>
        </h3>
        <div v-if="description" :class="descriptionClassName">
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </div>
      <div v-if="action" :class="`ps-2 ${actionClassName}`">
        <slot name="action">
          {{ action }}
        </slot>
      </div>
    </div>
    <slot />
  </div>
</template>
