<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'
import Icon from '@/components/atoms/Icon.vue'
import { cn } from '@/lib/utils'

const authUser = {
  role: 'admin',
}

const props = defineProps({
  menu: {
    type: Object,
    required: true,
  },
})

const route = useRoute()

const isActive = computed(() => (href: string) => {
  if (!href || typeof href !== 'string') return false

  return route.path === href || (route.path && route.path.endsWith(href)) || href.includes(route.path.split('/')[2])
})

const isDropdownOpen = computed(() => (item: any) =>
  item.dropdownItems?.some((item: any) => item.href === route.path),
)

const filteredMenu = computed(() => {
  return props.menu
    .filter((menu: any) => menu.role.includes(authUser.role))
    .map((menu: any) => ({
      ...menu,
      dropdownItems: menu.dropdownItems?.filter((item: any) => item.role.includes(authUser.role)) || [],
    }))
})

const activeAccordionItem = computed(() => {
  const activeItem = filteredMenu.value.find((item: any) =>
    item.dropdownItems?.some((subItem: any) => subItem.href === route.path),
  )
  return activeItem ? activeItem.name : ''
})
</script>

<template>
  <div class="sidebar-menu">
    <template v-if="props.menu">
      <template v-for="item in filteredMenu" :key="item.href || item.name">
        <template v-if="item.href">
          <template v-if="item?.dropdownItems?.length">
            <AccordionRoot type="single" collapsible :default-value="activeAccordionItem">
              <AccordionItem :key="item?.name" :value="item?.name">
                <AccordionHeader class="flex">
                  <AccordionTrigger
                    :class="cn('group menu-trigger truncate', isDropdownOpen(item)
                      ? 'is-menu-open text-primary bg-gray-100 dark:bg-theme-border'
                      : 'menu-not-open')"
                  >
                    <span class="wrapper">
                      <span
                        v-if="item?.icon"
                        :class="cn(
                          'icon', isDropdownOpen(item) ? 'is-menu-open' : 'menu-not-open text-primary')"
                      >
                        <Icon :name="item.icon" />
                      </span>
                      <span class="truncate w-10/12 text-left">{{ item?.name }}</span>
                    </span>
                    <Icon
                      name="radix-icons:chevron-down"
                      class="menu-arrow-icon text-xl ease-[cubic-bezier(0.87, _0, _0.13, _1)] group-data-[state=open]:rotate-180"
                    />
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent class="AccordionContent">
                  <div>
                    <NuxtLink
                      v-for="(dropdownItem, index) in item?.dropdownItems"
                      :key="dropdownItem?.name + index"
                      :to="dropdownItem?.href"
                      :class="[
                        'sidebar-link',
                        route.path === dropdownItem?.href ? 'text-primary' : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-theme-border',
                      ]"
                    >
                      <div class="flex items-center truncate">
                        <span
                          :class="[
                            'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
                            route.path === dropdownItem?.href ? 'bg-primary ring-[1px] ring-primary' : 'opacity-40',
                          ]"
                        />
                        <span class="truncate text-sm">{{ dropdownItem?.name }}</span>
                      </div>
                    </NuxtLink>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </AccordionRoot>
          </template>
          <template v-else>
            <NuxtLink
              :to="item?.href"
              :class="[
                'group relative mx-3 my-1 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize',
                isActive(item?.href)
                  ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5 bg-primary/10'
                  : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-theme-border obotoronika-text-color',
              ]"
            >
              <div class="flex items-center truncate">
                <span
                  v-if="item?.icon"
                  :class="[
                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md',
                    isActive(item?.href)
                      ? 'text-primary'
                      : 'obotoronika-text-color',
                  ]"
                >
                  <Icon :name="item.icon" class="!text-2xl" />
                </span>
                <span class="truncate text-sm">{{ item.name }}</span>
              </div>
            </NuxtLink>
          </template>
        </template>
        <template v-else>
          <h6 class="mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest text-gray-500 2xl:px-8">
            {{ item.name }}
          </h6>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
.sidebar-menu {
  @apply mt-4 pb-3 3xl:mt-6 px-2;

  .menu-trigger {
    @apply relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium my-1 w-full text-sm;

    &.is-menu-open {
      &:before {
        content: '';
        @apply absolute -start-3 block h-4/5 w-1 rounded-ee-md rounded-se-md bg-primary 2xl:-start-5;
      }
    }

    &.menu-not-open {
      @apply text-gray-700 transition-colors duration-200 dark:hover:bg-theme-border obotoronika-text-color;
    }

    .wrapper {
      @apply flex items-center;

      .icon {
        @apply me-2 inline-flex items-center justify-center rounded-md text-xl;

        &.is-menu-open {
          @apply text-primary;
        }

        &.menu-not-open {
          @apply text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-dark-text dark:hover:text-gray-700 dark:hover:bg-theme-border;
        }
      }
    }

    .menu-arrow-icon {
      @apply transition-transform duration-300;
    }
  }

  .AccordionContent {
    overflow: hidden;

    a.sidebar-link {
      @apply mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5;
    }
  }

  .AccordionContent[data-state="open"] {
    animation: slideDown 300ms ease-out;
  }

  .AccordionContent[data-state="closed"] {
    animation: slideUp 300ms ease-out;
  }

  @keyframes slideDown {
    from {
      height: 0;
    }

    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
    }

    to {
      height: 0;
    }
  }
}
</style>
