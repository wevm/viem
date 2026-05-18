interface ImportMetaEnv {
  readonly VITE_TEMPO_CREDENTIALS?: string
  readonly VITE_TEMPO_ENV?: string
  readonly VITE_TEMPO_HTTP_LOG?: string
  readonly VITE_TEMPO_LOG?: string
  readonly VITE_TEMPO_TAG?: string
  readonly VITEST_POOL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
