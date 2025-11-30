/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
        readonly PUBLIC_WALINE_SERVER?: string;
}

interface ImportMeta {
        readonly env: ImportMetaEnv;
}
