/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_URL: string;
  readonly VITE_VERIFY_TOKEN: string;
  readonly VITE_APP_SECRET: string;
  readonly VITE_USER_PHONE: string;
  readonly VITE_BUSINESS_PHONE: string;
}

declare module '*.css' {
  const content: string;
  export default content;
}
