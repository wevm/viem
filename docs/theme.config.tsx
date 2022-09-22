/* eslint sort-keys: error */
import { useRouter } from 'next/router'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

import { ViemLogo } from './components/ViemLogo'

const github = 'https://github.com/wagmi-dev/viem'

const Vercel = () => (
  <svg height="20" viewBox="0 0 283 64" fill="none">
    <path
      fill="currentColor"
      d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
    />
  </svg>
)

const config: DocsThemeConfig = {
  chat: {
    icon: (
      <svg
        width="26"
        height="27"
        viewBox="0 0 26 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.01578 26.2622C7.50023 26.2622 7.87382 26.0299 8.45835 25.489L12.7626 21.5944H20.4504C23.9784 21.5944 25.9547 19.5777 25.9547 16.0998V7.01138C25.9547 3.53349 23.9784 1.50708 20.4504 1.50708H5.50218C1.97625 1.50708 0 3.52388 0 7.01138V16.0998C0 19.5872 2.02476 21.5944 5.42836 21.5944H5.90109V24.9898C5.90109 25.7606 6.30984 26.2622 7.01578 26.2622Z"
          fill="currentColor"
        />
        <path
          d="M7.08467 13.3635C6.08694 13.3635 5.26804 12.5521 5.26804 11.5447C5.26804 10.5395 6.08694 9.72815 7.08467 9.72815C8.08991 9.72815 8.90131 10.5395 8.90131 11.5447C8.90131 12.5521 8.08991 13.3635 7.08467 13.3635Z"
          fill="currentColor"
          style={{ filter: 'invert(100%)' }}
        />
        <path
          d="M12.9912 13.3635C11.9838 13.3635 11.1628 12.5521 11.1628 11.5447C11.1628 10.5395 11.9838 9.72815 12.9912 9.72815C13.9868 9.72815 14.8078 10.5395 14.8078 11.5447C14.8078 12.5521 13.9868 13.3635 12.9912 13.3635Z"
          fill="currentColor"
          style={{ filter: 'invert(100%)' }}
        />
        <path
          d="M18.8859 13.3635C17.8807 13.3635 17.0714 12.5521 17.0714 11.5447C17.0714 10.5395 17.8807 9.72815 18.8859 9.72815C19.8954 9.72815 20.7047 10.5395 20.7047 11.5447C20.7047 12.5521 19.8954 13.3635 18.8859 13.3635Z"
          fill="currentColor"
          style={{ filter: 'invert(100%)' }}
        />
      </svg>
    ),
    link: `${github}/discussions`,
  },
  darkMode: true,
  docsRepositoryBase: `${github}/tree/main/docs`,
  editLink: {
    text: 'Edit this page on GitHub →',
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
  },
  footer: {
    text() {
      return (
        <a
          rel="noopener noreferrer"
          target="_blank"
          className="flex items-center font-semibold gap-2"
          href="https://vercel.com/?utm_source=swr"
        >
          Powered by
          <Vercel />
        </a>
      )
    },
  },
  gitTimestamp: ({ timestamp }) => <>Last updated on {timestamp.toString()}</>,
  head() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const config = useConfig()
    const description =
      config.frontMatter.description ||
      'viem provides low-level building blocks for Ethereum apps.'
    return (
      <>
        {/* General */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />

        {/* SEO */}
        <meta name="description" content={description} />
        <meta name="og:description" content={description} />
        <meta name="og:title" content="viem" />
        <meta name="og:image" content="https://viem.sh/og.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Misc */}
        <meta name="apple-mobile-web-app-title" content="viem" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />

        {/* Dynamic favicon */}
        <link
          rel="icon"
          href="/icon-light.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/icon-dark.png"
          media="(prefers-color-scheme: dark)"
        />
      </>
    )
  },
  i18n: [{ locale: 'en-US', text: 'English' }],
  logo() {
    return (
      <span>
        <ViemLogo height={24} />
      </span>
    )
  },
  nextThemes: {
    defaultTheme: 'dark',
  },
  project: {
    link: github,
  },
  sidebar: {
    defaultMenuCollapsed: true,
  },
  titleSuffix: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { route } = useRouter()
    if (route.match(/^\/index(.)*/)) return ''
    return ' – viem'
  },
  toc: {
    float: true,
  },
}

export default config
