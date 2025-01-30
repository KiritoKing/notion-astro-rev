declare module 'astrowind:config' {
  export const SITE: import('./config').SiteConfig;
  export const I18N: import('./config').I18NConfig;
  export const METADATA: import('./config').MetaDataConfig;
  export const APP_BLOG: import('./config').AppBlogConfig;
  export const UI: import('./config').UIConfig;
  export const ANALYTICS: import('./config').AnalyticsConfig;
}
