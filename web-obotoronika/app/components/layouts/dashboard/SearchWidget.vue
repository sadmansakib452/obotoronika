<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script setup lang="ts">
import {
  CreditCard,
  ShoppingBag,
  Settings,
  User,
  // @ts-ignore
} from 'lucide-vue-next'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import Icon from '@/components/atoms/Icon.vue'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button class="h-10 active:translate-y-px text-xl flex gap-2 items-center justify-center">
        <Icon name="tabler:search" />
        <span class="text-sm obotoronika-text-color">Search...</span>
      </button>
    </PopoverTrigger>
    <PopoverContent class="md:w-80 lg:min-w-max z-[9999] mx-4" :align="'start'">
      <Command class="max-w-[280px] md:max-w-[450px]">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="Calendar">
              <ShoppingBag class="mr-2 h-4 w-4" />
              <span>Products</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem value="Profile">
              <User class="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem value="Billing">
              <CreditCard class="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem value="Settings">
              <Settings class="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
