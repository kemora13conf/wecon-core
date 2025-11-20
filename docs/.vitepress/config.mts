import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "@wecon/core",
  description: "A comprehensive TypeScript framework for building Express.js APIs with built-in RBAC and Postman docs.",
  base: '/wecon-core/', // Assuming deployment to github pages under repo name
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/reference' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Core Concepts', link: '/guide/core-concepts' }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Smart Routing', link: '/guide/routing' },
          { text: 'RBAC & Security', link: '/guide/rbac' },
          { text: 'Postman Integration', link: '/guide/postman' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'API Reference', link: '/api/reference' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kemora13conf/wecon-core' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Wecon'
    },

    search: {
      provider: 'local'
    }
  }
})
