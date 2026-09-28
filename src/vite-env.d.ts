/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

interface ImportMetaEnv {
  /** Sentry DSN. Leave unset to build without crash reporting. */
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
}
