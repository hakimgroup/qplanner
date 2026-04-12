import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'QPlanner Docs',
  description: 'Internal documentation for the QPlanner campaign planning system',
  outDir: './.vitepress/dist',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Workflow', link: '/workflow/selection-lifecycle' },
      { text: 'Admin Guide', link: '/admin/user-management' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/overview' },
          { text: 'Architecture', link: '/architecture/' },
        ],
      },
      {
        text: 'Campaign Workflow',
        items: [
          { text: 'Selection Lifecycle', link: '/workflow/selection-lifecycle' },
          { text: 'Bespoke Campaigns', link: '/workflow/bespoke-campaigns' },
          { text: 'Status Transitions', link: '/workflow/status-transitions' },
        ],
      },
      {
        text: 'Admin Operations',
        items: [
          { text: 'User Management', link: '/admin/user-management' },
          { text: 'Campaign Management', link: '/admin/campaign-management' },
          { text: 'Bulk Operations', link: '/admin/bulk-operations' },
          { text: 'God Mode', link: '/admin/god-mode' },
        ],
      },
      {
        text: 'Database',
        items: [
          { text: 'Schema', link: '/database/schema' },
          { text: 'RPC Functions', link: '/database/rpc-functions' },
          { text: 'Triggers & Automation', link: '/database/triggers' },
        ],
      },
      {
        text: 'Email & Notifications',
        items: [
          { text: 'Notification System', link: '/notifications/system' },
          { text: 'Email Templates', link: '/notifications/email-templates' },
          { text: 'Notification Types', link: '/notifications/types' },
        ],
      },
      {
        text: 'Cron & Automation',
        items: [
          { text: 'Cron Jobs', link: '/automation/cron-jobs' },
          { text: 'n8n Integration', link: '/automation/n8n' },
        ],
      },
      {
        text: 'Deployment',
        items: [
          { text: 'Vercel Setup', link: '/deployment/vercel' },
          { text: 'Environment Variables', link: '/deployment/env-vars' },
        ],
      },
      {
        text: 'Troubleshooting',
        items: [
          { text: 'Common Issues', link: '/troubleshooting/common-issues' },
          { text: 'Known Limitations', link: '/troubleshooting/known-limitations' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'QPlanner Internal Documentation',
      copyright: 'Hakim Group',
    },
  },
})
