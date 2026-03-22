export interface StackLink {
  id: string;
  label: string;
  url: string;
  categoryId: string;
  order: number;
  icon?: string;
}

export interface StackCategory {
  id: string;
  label: string;
  order: number;
  collapsed: boolean;
}

export interface StackSidebarData {
  categories: StackCategory[];
  links: StackLink[];
  sidebarOpen: boolean;
}

export const DEFAULT_SIDEBAR_DATA: StackSidebarData = {
  sidebarOpen: false,
  categories: [
    { id: 'deploy',       label: 'DEPLOY',       order: 0, collapsed: false },
    { id: 'data',         label: 'DATA',         order: 1, collapsed: false },
    { id: 'auth',         label: 'AUTH',         order: 2, collapsed: false },
    { id: 'monetization', label: 'MONETIZATION', order: 3, collapsed: false },
    { id: 'monitoring',   label: 'MONITORING',   order: 4, collapsed: false },
    { id: 'tools',        label: 'TOOLS',        order: 5, collapsed: false },
  ],
  links: [
    { id: 'vercel',     label: 'Vercel',            url: 'https://vercel.com/dashboard',                       categoryId: 'deploy',       order: 0, icon: '▲' },
    { id: 'cf-pages',   label: 'Cloudflare',        url: 'https://dash.cloudflare.com',                        categoryId: 'deploy',       order: 1, icon: '☁' },
    { id: 'eas',        label: 'EAS / Expo',        url: 'https://expo.dev',                                   categoryId: 'deploy',       order: 2, icon: '⬡' },
    { id: 'asc',        label: 'App Store Connect', url: 'https://appstoreconnect.apple.com',                  categoryId: 'deploy',       order: 3, icon: '⬝' },
    { id: 'turso',      label: 'Turso',             url: 'https://app.turso.tech',                             categoryId: 'data',         order: 0, icon: '◎' },
    { id: 'drizzle',    label: 'Drizzle Studio',    url: 'https://local.drizzle.studio',                       categoryId: 'data',         order: 1, icon: '💧' },
    { id: 'clerk',      label: 'Clerk',             url: 'https://dashboard.clerk.com',                        categoryId: 'auth',         order: 0, icon: '🔐' },
    { id: 'rc',         label: 'RevenueCat',        url: 'https://app.revenuecat.com',                         categoryId: 'monetization', order: 0, icon: '💰' },
    { id: 'porkbun',    label: 'Porkbun',           url: 'https://porkbun.com/account/domainsSpeedy',          categoryId: 'monetization', order: 1, icon: '🐷' },
    { id: 'sentry',     label: 'Sentry',            url: 'https://sentry.io/organizations/vickery-digital',    categoryId: 'monitoring',   order: 0, icon: '👁' },
    { id: 'github',     label: 'GitHub',            url: 'https://github.com/vickerydigital',                  categoryId: 'tools',        order: 0, icon: '⌥' },
    { id: 'lovable',    label: 'Lovable',           url: 'https://lovable.dev',                                categoryId: 'tools',        order: 1, icon: '🌿' },
    { id: 'claude',     label: 'Claude',            url: 'https://claude.ai',                                  categoryId: 'tools',        order: 2, icon: '◆' },
    { id: 'anthropic',  label: 'Anthropic API',     url: 'https://console.anthropic.com',                      categoryId: 'tools',        order: 3, icon: '◆' },
  ],
};
