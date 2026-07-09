<template>
  <div>
    <ul class="px-4">
      <li>
        Users paying with bkash for the first time: Enter bKash Wallet Number
        and OTP for successful account saving.
      </li>
      <li>For all subsequent users: Enter PIN to make payment</li>

      <b>Disclaimer: you will be redirected back to Checkout for first
        transaction to complete payment</b>

      <b>Please Note</b>
      <ul>
        <li>You have an activated bKash account</li>
        <li>
          Ensure you have sufficient balance in your bKash account to cover the
          total cost of the order
        </li>
        <li>
          Ensure you are able to receive your OTP (one-time-password) on your
          mobile and have bKash PIN
        </li>
      </ul>
      <b>
        ***Please note that one bkash account can only be saved in one Obotoronika
        account.***
      </b>
    </ul>
  </div>
</template>

<style scoped>
b{
    @apply font-medium text-sm obotoronika-text-color mt-3 block;
}
 li{
    @apply text-sm obotoronika-text-color mb-1 list-disc;
}
</style>
