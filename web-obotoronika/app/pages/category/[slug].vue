<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// Redirect legacy /category/:slug to /sections/:slug
await navigateTo(`/sections/${slug}`, { replace: true })
</script>
