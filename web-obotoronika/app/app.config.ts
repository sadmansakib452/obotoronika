export default defineAppConfig({
  ui: {
    primary: 'orange',
    gray: 'cool',
    checkbox: { base: 'cursor-pointer', label: 'cursor-pointer' },
    table: {
      wrapper: 'rounded-md border dark:border-theme-border',
      th: {
        base: 'bg-gray-50 dark:bg-dark',
        padding: 'py-3',
      },
      tr: {
        base: 'even:bg-gray-50 dark:even:bg-theme-border',
      },
      td: {
        padding: 'py-1.5',
      },
    },
    breadcrumb: {
      li: 'text-light-text dark:text-dark-text',
    },
    input: {
      default: {
        size: 'lg',
      },
      color: {
        white: {
          outline:
            'shadow-none border border-[#e5e7eb] dark:border-theme-border transition-colors focus:border-primary focus:dark:border-primary dark:bg-dark !ring-0',
        },
      },
    },
    select: {
      default: {
        size: 'lg',
      },
      color: {
        white: {
          outline:
            'shadow-none border border-[#e5e7eb] dark:border-theme-border transition-colors focus:border-primary focus:dark:border-primary dark:bg-dark !ring-0',
        },
      },
    },
    textarea: {
      color: {
        white: {
          outline:
            'shadow-none border border-[#e5e7eb] dark:border-theme-border transition-colors focus:border-primary focus:dark:border-primary dark:bg-dark !ring-0',
        },
      },
    },
    selectMenu: {
      default: {},
      background: 'dark:!bg-dark dark:!border-theme-border',
      select:
        '!ring-0 focus:!ring-0 border dark:border-theme-border shadow-none transition-colors focus:border-primary focus:dark:border-primary dark:!bg-dark',
    },
    radio: {
      border: 'border border-[#e5e7eb] dark:border-theme-border',
    },
    toggle: {
      base: 'border dark:border-theme-border',
    },
    button: {
      default: {
        size: 'lg',
      },
    },
  },
})
