import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>viem</title>
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
      </Head>
      <Component {...pageProps} />
      <style jsx global>
        {`
          html,
          body {
            border: none;
            margin: 0;
            overflow: hidden;
            padding: 0;
          }

          html,
          body,
          #__next {
            height: -webkit-fill-available;
          }

          body {
            background-color: white;
          }

          @media (prefers-color-scheme: dark) {
            body {
              background-color: black;
            }
          }
        `}
      </style>
    </>
  )
}

export default MyApp
