<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Forgot Password | Obotoronika',
})

const toast = useToast()
const router = useRouter()

const state = reactive({
  emailOrPhone: '',
})
const isLoading = ref(false)
const step = ref<'email' | 'verification'>('email')
const pin = ref('')

const handleSendCode = async () => {
  if (!state.emailOrPhone) {
    toast.add({ title: 'Error', description: 'Please enter your email or phone number', color: 'red' })
    return
  }

  isLoading.value = true
  try {
    const { error } = await useFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { emailOrPhone: state.emailOrPhone },
    })

    if (error.value) {
      toast.add({ title: 'Error', description: error.value.data?.message || 'Failed to send reset code', color: 'red' })
      return
    }

    toast.add({ title: 'Success', description: 'Reset code sent to your email', color: 'green' })
    step.value = 'verification'
  }
  finally {
    isLoading.value = false
  }
}

const handleVerifyAndReset = async () => {
  if (!pin.value || pin.value.length < 5) {
    toast.add({ title: 'Error', description: 'Please enter the 5-digit reset code', color: 'red' })
    return
  }

  router.push(`/reset-password?email=${encodeURIComponent(state.emailOrPhone)}&code=${pin.value}`)
}
</script>

<template>
  <div class="w-full flex justify-center px-4 py-10">
    <div class="w-full max-w-lg border obotoronika-border-color rounded-md dark:bg-dark p-6">
      <h3 class="font-bold text-3xl obotoronika-text-color mb-2">
        Reset Your Password
      </h3>
      <p class="text-base obotoronika-text-color mb-6">
        Enter your email or phone number to receive a reset code.
      </p>

      <!-- Step 1: Enter Email -->
      <div v-if="step === 'email'">
        <div class="input-group mb-4">
          <label for="emailOrPhone">Email or Phone</label>
          <UInput
            v-model="state.emailOrPhone"
            size="lg"
            placeholder="Enter your email or phone"
            class="mb-2"
          />
        </div>
        <UButton
          label="Send Reset Code"
          size="lg"
          block
          :loading="isLoading"
          @click="handleSendCode"
        />
      </div>

      <!-- Step 2: Enter OTP -->
      <div v-else>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Enter the 5-digit code sent to your email</label>
          <UiPinInput
            v-model="pin"
            placeholder="○"
          >
            <UiPinInputGroup class="gap-4">
              <UiPinInputInput
                v-for="(id, index) in 5"
                :key="id"
                class="rounded-md border w-14"
                :index="index"
              />
            </UiPinInputGroup>
          </UiPinInput>
        </div>
        <UButton
          label="Continue"
          size="lg"
          block
          @click="handleVerifyAndReset"
        />
        <p class="text-sm mt-4 text-center obotoronika-text-color">
          <button @click="step = 'email'">
            Change email address
          </button>
        </p>
      </div>

      <p class="text-sm mt-6 text-center obotoronika-text-color">
        Remember your password?
        <NuxtLink to="/login" class="text-primary font-semibold">
          Login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>