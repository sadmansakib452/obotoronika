<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Reset Password | Obotoronika',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref(route.query.email as string || '')
const code = ref(route.query.code as string || '')

const state = reactive({
  newPassword: '',
  confirmPassword: '',
})
const isLoading = ref(false)

const handleResetPassword = async () => {
  if (!state.newPassword) {
    toast.add({ title: 'Error', description: 'Please enter a new password', color: 'red' })
    return
  }

  if (state.newPassword.length < 8) {
    toast.add({ title: 'Error', description: 'Password must be at least 8 characters', color: 'red' })
    return
  }

  if (state.newPassword !== state.confirmPassword) {
    toast.add({ title: 'Error', description: 'Passwords do not match', color: 'red' })
    return
  }

  isLoading.value = true
  try {
    const { error } = await useFetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        emailOrPhone: email.value,
        code: code.value,
        newPassword: state.newPassword,
      },
    })

    if (error.value) {
      toast.add({ title: 'Error', description: error.value.data?.message || 'Failed to reset password', color: 'red' })
      return
    }

    toast.add({ title: 'Success', description: 'Password has been reset. Please login with your new password.', color: 'green' })
    router.push('/login')
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full flex justify-center px-4 py-10">
    <div class="w-full max-w-lg border obotoronika-border-color rounded-md dark:bg-dark p-6">
      <h3 class="font-bold text-3xl obotoronika-text-color mb-2">
        Create New Password
      </h3>
      <p class="text-base obotoronika-text-color mb-6">
        Enter a new password for your account.
      </p>

      <div class="space-y-4">
        <div class="input-group">
          <label for="newPassword">New Password</label>
          <UInput
            id="newPassword"
            v-model="state.newPassword"
            type="password"
            size="lg"
            placeholder="Enter new password"
            class="mb-2"
          />
          <p class="text-xs text-gray-500">Must be at least 8 characters</p>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Confirm New Password</label>
          <UInput
            id="confirmPassword"
            v-model="state.confirmPassword"
            type="password"
            size="lg"
            placeholder="Confirm new password"
            class="mb-2"
          />
        </div>

        <UButton
          label="Reset Password"
          size="lg"
          block
          :loading="isLoading"
          @click="handleResetPassword"
        />
      </div>

      <p class="text-sm mt-6 text-center obotoronika-text-color">
        <NuxtLink to="/login" class="text-primary font-semibold">
          Back to Login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>