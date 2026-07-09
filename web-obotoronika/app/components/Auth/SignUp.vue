<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import {
  validateEmail,
  validatePhoneNumber,
} from '@@/shared/utils/phoneEmailValidation'
import validateForm from './validateForm'
// @ts-ignore
import SocialLogin from './SocialLogin.vue'
import { UButton, UInput } from '#components'

const toast = useToast()

// Local variables
const errorMessage = ref('')
const errorMessages = reactive({
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
})
const state = reactive({
  emailOrPhone: 'aniket@gmail.com',
  pin: [],
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
})

const pin = ref('')
const step = ref('sendEmail')
const isLoading = ref(false)

const handleContinue = async () => {
  const { emailOrPhone } = state
  isLoading.value = true
  if (step.value === 'sendEmail') {
    if (!emailOrPhone) return errorMessage.value = 'Please enter a valid email address or phone number'
    if (!validateEmail(emailOrPhone) || validatePhoneNumber(emailOrPhone)) return errorMessage.value = 'Invalid email or phone'
    const payload = {
      emailOrPhone: emailOrPhone,
    }
    const { error } = await useFetch('/api/auth/verify-identifier', { method: 'POST', body: JSON.stringify(payload) })
    if (error.value) {
      isLoading.value = false
      throw error.value.message
    }
    isLoading.value = false
  }
  if (step.value === 'sendEmail') {
    step.value = 'verification'
    errorMessage.value = ''
  }
  else if (step.value === 'enterInfo') {
    const validationErrors = validateForm(state)
    isLoading.value = false
    Object.assign(errorMessages, validationErrors)
    const hasErrors = Object.values(validationErrors).some(error => error)
    if (!hasErrors) {
      isLoading.value = true
      const { pin, ...payload } = state

      const { error } = await useFetch('/api/auth/signup', { method: 'POST', body: payload })
      if (error.value) {
        isLoading.value = false
        toast.add({ title: 'Signup Error', description: 'Something went wrong. Please try again later.', color: 'red' })
        throw error.value.message
      }
      toast.add({ title: 'Registration Successful', description: 'Your account has been created successfully.', color: 'green' })
      isLoading.value = false
    }
  }
  else {
    if (state.pin.length < 4) {
      return errorMessage.value = 'The verification code must be 5 digits long.'
    }
    errorMessage.value = ''
    pin.value = state.pin.join('')
    const payload = {
      emailOrPhone: state.emailOrPhone,
      code: `${pin.value}`,
    }
    const { error } = await useFetch('/api/auth/verify', { method: 'POST', body: payload })
    if (error.value) {
      toast.add({ title: 'Verification Failed', description: error.value.data.message, color: 'red' })
      isLoading.value = false
      throw error.value.message
    }
    isLoading.value = false
    step.value = 'enterInfo'
  }
}

const handleComplete = (e: string[]) => {
  pin.value = [...state.pin, e] as any
}
</script>

<template>
  <div class="signup overflow-hidden px-2">
    <h3 class="font-bold text-3xl obotoronika-text-color">
      Join Obotoronika Today!
    </h3>
    <p class="text-base mt-1 obotoronika-text-color mb-4">
      Sign up to explore innovative products and exclusive deals. It's quick and free!
    </p>
    <form class="relative">
      <div :class="`input-group mb-4 ${step !== 'sendEmail' ? 'hidden' : ''}`">
        <label for="emailOrPhone">Enter your email or phone</label>
        <UInput
          id="emailOrPhone"
          v-model="state.emailOrPhone"
          size="lg"
          :color="errorMessage ? 'red' : 'white'"
          placeholder="Email or Phone"
          class="mb-2"
        />
        <p v-if="errorMessage" class="text-red-600 text-sm">
          {{ errorMessage }}
        </p>
      </div>
      <div :class="`input-group flex flex-col justify-center items-center ${step !== 'verification' ? 'hidden' : ''}`">
        <UiPinInput
          id="pin-input"
          v-model="state.pin"
          class="mb-4"
          placeholder="○"
          @complete="handleComplete"
        >
          <UiPinInputGroup class="gap-4">
            <UiPinInputInput
              v-for="(id, index) in 5"
              :key="id"
              class="rounded-md border w-16"
              :index="index"
            />
          </UiPinInputGroup>
        </UiPinInput>
        <p v-if="errorMessage" class="text-red-600 text-sm">
          {{ errorMessage }}
        </p>
      </div>
      <div :class="`${step !== 'enterInfo' ? 'hidden' : ''}`">
        <div class="input-group mb-4">
          <label for="firstName">Enter your first name</label>
          <UInput
            id="firstName"
            v-model="state.firstName"
            size="lg"
            :color="errorMessages.firstName ? 'red' : 'white'"
            placeholder="Email or Phone"
            class="mb-2"
          />
          <p v-if="errorMessages.firstName" class="text-red-600 text-sm">
            {{ errorMessages.firstName }}
          </p>
        </div>
        <div class="input-group mb-4">
          <label for="lastName">Enter your last name</label>
          <UInput
            id="lastName"
            v-model="state.lastName"
            size="lg"
            :color="errorMessages.lastName ? 'red' : 'white'"
            placeholder="Email or Phone"
            class="mb-2"
          />
          <p v-if="errorMessages.lastName" class="text-red-600 text-sm">
            {{ errorMessages.lastName }}
          </p>
        </div>
        <div class="input-group mb-4">
          <label for="password">Enter your password</label>
          <UInput
            id="password"
            v-model="state.password"
            size="lg"
            :color="errorMessages.password ? 'red' : 'white'"
            placeholder="Email or Phone"
            class="mb-2"
          />
          <p v-if="errorMessages.password" class="text-red-600 text-sm">
            {{ errorMessages.password }}
          </p>
        </div>
        <div class="input-group mb-4">
          <label for="confirmPassword">Confirm your password</label>
          <UInput
            id="confirmPassword"
            v-model="state.confirmPassword"
            size="lg"
            :color="errorMessages.confirmPassword ? 'red' : 'white'"
            placeholder="Email or Phone"
            class="mb-2"
          />
          <p v-if="errorMessages.confirmPassword" class="text-red-600 text-sm">
            {{ errorMessages.confirmPassword }}
          </p>
        </div>
      </div>
      <UButton
        label="Continue"
        size="lg"
        block
        :loading="isLoading"
        @click="handleContinue"
      />
    </form>
    <SocialLogin />
    <p class="text-sm mt-4 text-center obotoronika-text-color">
      Already have an account? <button @click="$emit('switchToLogin')">
        Sign
        In
      </button>
    </p>
  </div>
</template>
