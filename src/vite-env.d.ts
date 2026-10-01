/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_CAT_API_KEY?: string
  readonly VITE_TMDB_PROXY_URL?: string
  readonly VITE_TMDB_TOKEN?: string
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string
  readonly VITE_RAWG_API_KEY?: string
  readonly VITE_SHOP_DEV_UNLOCK_ALL?: string
  readonly VITE_PREMIUM_DEV_UNLOCK_ALL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string
declare const __APP_BUILT_AT__: string
