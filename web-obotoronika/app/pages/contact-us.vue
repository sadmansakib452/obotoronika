<script lang="ts" setup>
definePageMeta({ roles: [] })
</script>

<template>
  <div class="w-11/12 lg:w-2/3 mx-auto my-16">
    <h1 class="text-2xl lg:text-3xl font-bold obotoronika-title mb-8 text-center">
      Contact Us
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <!-- Contact Info -->
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold mb-2 text-[#FC6A03]">Get in Touch</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Have questions about your order or need help? We're here for you.
          </p>
        </div>
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>Email: support@obotoronika.com</p>
          <p>Phone: +880 1700-000000</p>
          <p>Address: Dhaka, Bangladesh</p>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Name</label>
          <input
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#14141f] text-sm"
            placeholder="Your name"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
          <input
            type="email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#14141f] text-sm"
            placeholder="your@email.com"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Message</label>
          <textarea
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#14141f] text-sm resize-none"
            placeholder="How can we help?"
          />
        </div>
        <button class="bg-[#FC6A03] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          Send Message
        </button>
      </div>
    </div>
  </div>
</template>
