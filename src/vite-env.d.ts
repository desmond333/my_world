/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAT_API_KEY?: string
  readonly VITE_TMDB_PROXY_URL?: string
  readonly VITE_TMDB_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
