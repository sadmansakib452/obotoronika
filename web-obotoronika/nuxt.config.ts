/* eslint-disable nuxt/nuxt-config-keys-order */
function deriveSupabaseStorageKey(supabaseUrl?: string, override?: string) {
  const trimmedOverride = override?.trim()
  if (trimmedOverride) return trimmedOverride
  const trimmedUrl = supabaseUrl?.trim()
  if (!trimmedUrl) return undefined
  try {
    const projectRef = new URL(trimmedUrl).hostname.split('.')[0]
    return projectRef ? `sb-${projectRef}-auth-token` : undefined
  }
  catch {
    return undefined
  }
}

const derivedSupabaseStorageKey = deriveSupabaseStorageKey(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_STORAGE_KEY,
)

export default defineNuxtConfig({

  modules: [
    'nuxt-color-picker',
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    ['@pinia/nuxt', {
      autoImports: [
        'defineStore',
        'acceptHMRUpdate',
        'storeToRefs',
      ],
    }],
    '@nuxtjs/device',
    'nuxt-qrcode',
  ],
  plugins: ['~/plugins/auth-api.client.ts'],
  imports: {
    dirs: ['./app/stores'],
  },
  devtools: { enabled: true },
  icon: {
    serverBundle: 'local',
    clientBundle: { scan: true },
  },
  app: {
    // pageTransition: {
    //   name: 'fade',
    //   mode: 'out-in',
    // },
    // layoutTransition: {
    //   name: '',
    //   mode: 'default'
    // },
    spaLoadingTemplate: '~/app/spa-loading-template.html',
  },
  css: ['./app/assets/styles/main.css'],
  experimental: {
    compileTemplate: true,
    scanPageMeta: true,
  },
  ui: {
    global: false,
  },
  runtimeConfig: {
    /** Server-side Supabase admin client (service role). */
    supabaseURL: process.env.SUPABASE_URL,
    supabaseRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    STORE_ID: process.env.STORE_ID,
    STORE_PASSWORD: process.env.STORE_PASSWORD,
    baseUrl: process.env.BASE_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      // Keep storage key consistent (prevents “tokens exist but UI shows logged out”).
      supabaseStorageKey: derivedSupabaseStorageKey,
      mediaUrl: process.env.MEDIA_URL || 'https://obotoronika-media-api.sadmansakib553.workers.dev',
    },
    databaseUrl: process.env.DATABASE_URL,
  },
  routeRules: {
    '/auth/**': { ssr: false },
    '/auth/callback': { ssr: true },
    // Dashboard uses client-side auth only, but removing ssr:false ensures
    // SPA navigation does not hang on dynamic chunk loading during layout/page import resolution.
    // '/dashboard/**': { ssr: false },
    '/user/**': { ssr: false },
    '/cart': { ssr: false },
    '/checkout/**': { ssr: false },
    '/order-received': { ssr: false },
    '/order-received/**': { ssr: false },
    '/fail': { ssr: false },
    '/cancel': { ssr: false },
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-07-30',
  hub: {
    blob: true,
    cache: process.env.NODE_ENV !== 'development',
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },
  shadcn: {
    componentDir: './app/components/ui',
  },
  vite: {
    warmup: {
      client: ['**/*.vue', '**/*.ts', '**/*.js'],
    },
    server: {
      // When running `nuxt dev` behind a reverse proxy / DDNS, Vite blocks unknown hosts by default.
      // Allow our public hostnames so `https://obotoronika.ddns.net` works in dev mode.
      allowedHosts: [
        ...(process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : ['obotoronika.ddns.net', 'db.obotoronika.ddns.net']),
        'localhost',
        '127.0.0.1',
      ],
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
    },
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    // @ts-expect-error - supported at runtime by @nuxtjs/supabase
    useSsrCookies: true,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      cookieRedirect: true,
      exclude: [
        '/',
        '/login',
        '/auth/callback',
        '/auth/login',
        '/auth/signup',
        '/forgot-password',
        '/reset-password',
        // Public product/category/section pages (dynamic routes)
        '/products/*',
        '/sections',
        '/sections/*',
        '/category/*',
        // Public informational pages
        '/privacy-policy',
        '/terms-and-conditions',
        '/contact-us',
        // Cart & checkout flow (guest checkout supported)
        '/cart',
        '/shipping',
        '/checkout/payment-method',
        '/checkout/payment-gateway/*',
        '/checkout/payment-gateway',
        // Payment gateway return URLs must be accessible even if SSR cookies are missing
        '/order-received',
        '/fail',
        '/cancel',
      ],
    },
    clientOptions: {
      auth: {
        autoRefreshToken: true,
        flowType: 'pkce',
        storageKey: derivedSupabaseStorageKey,
      },
    },
  },
})
