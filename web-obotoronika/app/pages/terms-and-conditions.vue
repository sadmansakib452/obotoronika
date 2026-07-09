<script lang="ts" setup>
const lastUpdated = 'February 1, 2026'

useHead({
  title: 'Terms and Conditions | Obotoronika',
  meta: [
    {
      name: 'description',
      content: 'Terms and Conditions for using Obotoronika. Please read these terms carefully before using our website and services.',
    },
  ],
})
</script>

<template>
  <article class="legal-page">
    <header class="legal-page-header">
      <h1 class="legal-page-title">
        Terms and Conditions
      </h1>
      <p class="legal-page-meta">
        Last updated: {{ lastUpdated }}
      </p>
    </header>

    <div class="legal-page-content obotoronika-text-color">
      <section class="legal-section">
        <h2 class="legal-heading">
          Acceptance of Terms
        </h2>
        <p class="legal-body">
          By accessing or using the Obotoronika website and services ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Use of the Service
        </h2>
        <p class="legal-body">
          You agree to use the Service only for lawful purposes and in accordance with these terms. You must not:
        </p>
        <ul class="legal-list">
          <li>Use the Service in any way that violates applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to our systems, accounts, or networks</li>
          <li>Use the Service to transmit any harmful, offensive, or illegal content</li>
          <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
          <li>Use automated means (e.g. bots, scrapers) without our prior written consent</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Account Registration
        </h2>
        <p class="legal-body">
          When you create an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Orders and Payment
        </h2>
        <p class="legal-body">
          All orders are subject to availability and acceptance. We reserve the right to refuse or cancel orders at our discretion. Prices are as displayed at the time of order; we strive to ensure accuracy but errors may occur. Payment must be made by the methods we accept. By placing an order, you represent that you are authorized to use the payment method provided.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Shipping and Delivery
        </h2>
        <p class="legal-body">
          Delivery times are estimates and not guaranteed. Risk of loss and title for items pass to you upon delivery to the carrier. We are not responsible for delays caused by carriers or events outside our control.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Returns and Refunds
        </h2>
        <p class="legal-body">
          Our return and refund policy is set out on our website and may vary by product. You must comply with any stated return procedures and time limits. Refunds will be processed in accordance with our policy and applicable law.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Intellectual Property
        </h2>
        <p class="legal-body">
          All content on the Service, including text, graphics, logos, images, and software, is the property of Obotoronika or its licensors and is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Limitation of Liability
        </h2>
        <p class="legal-body">
          To the fullest extent permitted by law, Obotoronika shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of or inability to use the Service.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Changes to Terms
        </h2>
        <p class="legal-body">
          We may update these Terms and Conditions from time to time. We will notify you of material changes by posting the updated terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated terms.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-heading">
          Contact Us
        </h2>
        <p class="legal-body">
          If you have questions about these Terms and Conditions, please contact us at:
        </p>
        <p class="legal-body">
          <strong>Obotoronika</strong><br>
          Email: legal@obotoronika.com<br>
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
