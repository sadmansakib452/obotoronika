<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { z } from 'zod'
import { UButton, UForm, UFormGroup, UInput } from '#components'

const toast = useToast()
const supabase = useSupabaseClient()
const authStore = useAuthStore()
const schema = z.object({
  emailOrPhone: z.string().nonempty('Please enter your email or phone number'),
  password: z.string().nonempty('Please enter a valid password'),
})

const state = reactive({
  emailOrPhone: '',
  password: '',
})
const isLoading = ref(false)

const passwordVisibility = ref(false)
const isLogin = ref(true)

// Emit events to notify the parent component
const emit = defineEmits(['login-success'])

const handleSubmit = async (event: any) => {
  event.preventDefault()
  try {
    isLoading.value = true
    const emailOrPhone = state.emailOrPhone.trim()
    const password = state.password

    const { error, data } = await supabase.auth.signInWithPassword({
      // NOTE: Supabase password sign-in expects email. This project UI also allows phone,
      // but server-side sign-in was effectively using this as "email". Keep behavior.
      email: emailOrPhone,
      password,
    })
    if (error) throw error

    // Create our app-level session row + httpOnly session_token cookie
    const accessToken = data?.session?.access_token
    await $fetch('/api/auth/post-login', {
      method: 'POST',
      credentials: 'include',
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      body: data?.session ? { session: data.session } : undefined,
    })
    await authStore.fetchUser()

    // Emit login success event
    emit('login-success')
  }
  catch (e) {
    toast.add({
      color: 'red',
      title: 'Authentication Failed',
      description: e instanceof Error
        ? e.message
        : 'The credentials you entered are invalid. Please try again.',
    })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="py-8 px-6">
    <div v-if="isLogin" class="login">
      <h3 class="font-bold text-3xl obotoronika-text-color">
        Hey, Hello
      </h3>
      <p class="text-base obotoronika-text-color mt-1 mb-4">
        Enter the information you entered while registering.
      </p>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        :validate-on="['submit']"
      >
        <UFormGroup label="Enter your email or phone" name="emailOrPhone" required>
          <UInput v-model="state.emailOrPhone" placeholder="Email or Phone" size="lg" />
        </UFormGroup>
        <UFormGroup label="Enter your password" name="password" required>
          <UInput
            v-model="state.password"
            placeholder="**********"
            size="lg"
            :ui="{ icon: { trailing: { pointer: '' } } }"
            :type="passwordVisibility ? 'text' : 'password'"
          >
            <template #trailing>
              <UButton
                v-show="true"
                color="gray"
                variant="link"
                :icon="`i-heroicons-eye${passwordVisibility ? '-slash' : ''}`"
                @click="passwordVisibility = !passwordVisibility"
              />
            </template>
          </UInput>
        </UFormGroup>
        <UButton
          type="submit"
          label="Login"
          size="lg"
          block
          class="mt-4"
          @click="handleSubmit"
        />
      </UForm>
      <div class="flex justify-end mt-4">
        <NuxtLink to="/forgot-password" class="text-gray-700 ml-auto text-sm hover:underline">
          Forgot password?
        </NuxtLink>
      </div>
      <AuthSocialLogin />
      <p class="text-sm mt-4 text-center obotoronika-text-color">
        Don't have an account?
        <button @click="isLogin = false">
          Sign Up
        </button>
      </p>
    </div>
    <AuthSignUp v-else @switch-to-login="() => (isLogin = true)" />
  </div>
</template>
