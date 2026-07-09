<script lang="ts" setup>
const lastUpdated = 'February 1, 2026'
</script>

<template>
  <article class="legal-page">
    <header class="legal-page-header">
      <h1 class="legal-page-title">
        Privacy Policy
      </h1>
      <p class="legal-page-meta">
        Last updated: {{ lastUpdated }}
      </p>
    </header>

    <div class="legal-page-content obotoronika-text-color">
      <section class="legal-section">
        <h2 class="legal-heading">
          Introduction
        </h2>
        <p class="legal-body">
          Obotoronika ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. Please read this policy carefully.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Information We Collect
        </h2>
        <p class="legal-body">
          We may collect information about you in a variety of ways, including:
        </p>
        <ul class="legal-list">
          <li><strong>Personal Data:</strong> Name, email address, phone number, shipping and billing address, and payment information when you create an account or place an order.</li>
          <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, pages visited, and time spent on our site.</li>
          <li><strong>Device Data:</strong> Information about the device you use to access our services, such as device type and operating system.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          How We Use Your Information
        </h2>
        <p class="legal-body">
          We use the information we collect to:
        </p>
        <ul class="legal-list">
          <li>Process and fulfill your orders</li>
          <li>Create and manage your account</li>
          <li>Send order confirmations, shipping updates, and customer support responses</li>
          <li>Improve our website, products, and services</li>
          <li>Send promotional communications (with your consent)</li>
          <li>Comply with legal obligations and prevent fraud</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Cookies and Tracking
        </h2>
        <p class="legal-body">
          We use cookies and similar tracking technologies to enhance your experience. Cookies help us remember your preferences, keep you signed in, and understand how you use our site. You can control cookie settings through your browser.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Sharing Your Information
        </h2>
        <p class="legal-body">
          We may share your information with:
        </p>
        <ul class="legal-list">
          <li><strong>Service providers:</strong> Payment processors, shipping carriers, and analytics providers who assist in operating our business</li>
          <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
        </ul>
        <p class="legal-body">
          We do not sell your personal information to third parties.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Data Security
        </h2>
        <p class="legal-body">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Payment information is processed through secure, PCI-compliant providers.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Your Rights
        </h2>
        <p class="legal-body">
          Depending on your location, you may have the right to:
        </p>
        <ul class="legal-list">
          <li>Access and receive a copy of your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p class="legal-body">
          To exercise these rights, please contact us using the details below.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Contact Us
        </h2>
        <p class="legal-body">
          If you have questions about this Privacy Policy or our data practices, please contact us at:
        </p>
        <p class="legal-body">
          <strong>Obotoronika</strong><br>
          Email: privacy@obotoronika.com<br>
          Or via our
          <NuxtLink to="/contact-us" class="legal-link">
            Contact Us
          </NuxtLink>
          page.
        </p>
      </section>
    </div>
  </article>
</template>

<style scoped>
.legal-page {
  @apply w-11/12 mx-auto max-w-4xl py-10 lg:py-14;
}

.legal-page-header {
  @apply border-b obotoronika-border-color pb-6 mb-8;
}

.legal-page-title {
  @apply text-2xl font-bold obotoronika-title lg:text-3xl;
}

.legal-page-meta {
  @apply mt-2 text-sm obotoronika-muted-text;
}

.legal-page-content {
  @apply space-y-8;
}

.legal-section {
  @apply space-y-3;
}

.legal-heading {
  @apply text-lg font-semibold obotoronika-title lg:text-xl;
}

.legal-body {
  @apply obotoronika-text text-sm leading-relaxed lg:text-base;
}

.legal-list {
  @apply list-disc pl-6 space-y-2 obotoronika-text text-sm leading-relaxed lg:text-base;
}

.legal-link {
  @apply text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded;
}
</style>
