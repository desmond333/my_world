/// <reference types="vite/client" />

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
