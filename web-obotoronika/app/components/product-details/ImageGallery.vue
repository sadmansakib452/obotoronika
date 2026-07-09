<script lang="ts" setup>
const props = defineProps<{
  images: Image[]
}>()

const activeImage = ref(props.images[0])
const showLightbox = ref(false)
const lightboxClosing = ref(false) // Track if the lightbox is closing

const handleSetActiveImage = (item: Image) => {
  activeImage.value = item
}

const openLightbox = () => {
  showLightbox.value = true
  lightboxClosing.value = false
}

const closeLightbox = () => {
  lightboxClosing.value = true
  showLightbox.value = false
}

const nextImage = () => {
  const currentIndex = props.images.findIndex(img => img.url === activeImage.value?.url)
  const nextIndex = (currentIndex + 1) % props.images.length
  activeImage.value = props.images[nextIndex]
}

const prevImage = () => {
  const currentIndex = props.images.findIndex(img => img.url === activeImage.value?.url)
  const prevIndex = (currentIndex - 1 + props.images.length) % props.images.length
  activeImage.value = props.images[prevIndex]
}
</script>

<template>
  <div class="image-gallery">
    <div class="image" @click="openLightbox">
      <img :src="activeImage?.url" alt="Image">
    </div>

    <div class="images">
      <div v-for="(item, index) in images" :key="index">
        <img
          :class="['thumbnail', { 'is-active': item.url === activeImage?.url }]"
          :src="item.url"
          alt="Image"
          @click="handleSetActiveImage(item)"
        >
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="showLightbox"
      :class="['fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center lightbox-overlay', { closing: lightboxClosing }]"
      @click.self="closeLightbox"
    >
      <div class="max-w-4xl w-full p-4 flex justify-center items-center lightbox-content">
        <button
          class="absolute top-2 right-2 text-white text-5xl"
          @click="closeLightbox"
        >
          &times;
        </button>
        <button
          class="absolute left-4 text-white text-4xl z-50 w-12 h-12 flex items-center justify-center"
          aria-label="Previous image"
          @click="prevImage"
        >
          &#8249;
        </button>
        <img
          :src="activeImage?.url"
          class="w-auto h-auto object-contain max-h-[90vh] rounded-md"
        >
        <button
          class="absolute right-4 text-white text-4xl z-50 w-12 h-12 flex items-center justify-center"
          aria-label="Next image"
          @click="nextImage"
        >
          &#8250;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-gallery {
  @apply col-span-12 lg:col-span-5;

  .image {
    @apply border h-80 lg:h-96 rounded-md obotoronika-border-color;

    img {
      @apply w-full h-full rounded-md object-contain cursor-pointer;
    }
  }

  .images {
    @apply flex gap-2 mt-4;

    > div {
      @apply w-20 h-20 border rounded-md obotoronika-border-color;

      img {
        @apply w-full h-full rounded-md cursor-pointer;
      }
    }

    .thumbnail {
      @apply w-full h-full cursor-pointer opacity-60 object-contain;
      transition: opacity 0.3s ease-in-out;
    }

    .thumbnail.is-active,
    .thumbnail:hover {
      opacity: 1;
    }
  }
}

/* Lightbox Styles */
.lightbox-overlay {
  animation: fadeIn 0.3s ease-in-out; /* Fade-in animation for the overlay */
}

.lightbox-content {
  animation: scaleIn 0.3s ease-in-out; /* Scale-in animation for the content */
}

.lightbox-content img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.lightbox-close:hover {
  color: red;
}

button {
  background: transparent;
  border: none;
  cursor: pointer;
}

button:hover {
  color: red;
}

/* Keyframes for animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
