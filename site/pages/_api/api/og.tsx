import { ImageResponse } from '@takumi-rs/image-response/wasm'
// @ts-expect-error - vite resolves the wasm binary to an emitted asset URL
import wasm from '@takumi-rs/wasm/takumi_wasm_bg.wasm?url'
// @ts-expect-error - vite resolves font/image assets to emitted asset URLs
import geistUrl from '../../../og/fonts/Geist-Variable.woff2?url'
// @ts-expect-error - vite resolves font/image assets to emitted asset URLs
import instrumentSerifUrl from '../../../og/fonts/InstrumentSerif-Regular.woff2?url'
// @ts-expect-error - vite resolves font/image assets to emitted asset URLs
import instrumentSerifItalicUrl from '../../../og/fonts/InstrumentSerif-Italic.woff2?url'
// @ts-expect-error - vite resolves font/image assets to emitted asset URLs
import jetbrainsMonoUrl from '../../../og/fonts/JetBrainsMono-Medium.woff2?url'
// Dashed 45° grid — mirrors the landing background in site/pages/_root.css.
// Pre-rasterized to PNG since Takumi's <img> doesn't render SVG data URIs.
// @ts-expect-error - vite resolves font/image assets to emitted asset URLs
import patternUrl from '../../../og/pattern.png?url'

// Logo lives in the Vocs public directory, served at the site root.
const logoPath = '/icon-dark.png'

// Palette — mirrors the landing tokens in site/pages/_root.css (dark mode).
const colors = {
  bg: '#14110c',
  primary: '#f1ebde',
  secondary: '#a39a85',
  muted: '#6e665a',
  accent: '#bfd655',
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Viem'
  const description =
    url.searchParams.get('description') || 'Ethereum Interface for Humans & Agents'

  try {
    const fetchBuffer = (asset: string) =>
      fetch(new URL(asset, url.origin)).then((r) => r.arrayBuffer())

    const [
      module,
      geist,
      instrumentSerif,
      instrumentSerifItalic,
      jetbrainsMono,
      patternBuffer,
      logoBuffer,
    ] = await Promise.all([
      fetchBuffer(wasm),
      fetchBuffer(geistUrl),
      fetchBuffer(instrumentSerifUrl),
      fetchBuffer(instrumentSerifItalicUrl),
      fetchBuffer(jetbrainsMonoUrl),
      fetchBuffer(patternUrl),
      fetchBuffer(logoPath),
    ])

    const toPngDataUri = (buffer: ArrayBuffer) =>
      `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
    const logoDataUri = toPngDataUri(logoBuffer)
    const patternDataUri = toPngDataUri(patternBuffer)

    const element = (
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: colors.bg,
          fontFamily: 'Geist',
          overflow: 'hidden',
        }}
      >
        {/* Dashed 45° grid background */}
        <img
          src={patternDataUri}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
          }}
        />

        {/* Ghost logo watermark, bleeding off the right edge */}
        <img
          src={logoDataUri}
          style={{
            position: 'absolute',
            top: 30,
            right: -150,
            width: 570,
            height: 570,
            opacity: 0.05,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            padding: '0 80px',
          }}
        >
          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Instrument Serif',
              fontSize: 92,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: colors.primary,
              maxWidth: 760,
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.4,
              color: colors.secondary,
              maxWidth: 680,
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'absolute',
            left: 80,
            bottom: 56,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 12,
              height: 12,
              backgroundColor: colors.accent,
            }}
          />
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: colors.muted,
            }}
          >
            viem.sh
          </div>
        </div>
      </div>
    )

    return new ImageResponse(element, {
      module,
      width: 1200,
      height: 630,
      format: 'png',
      fonts: [
        {
          name: 'Geist',
          data: Buffer.from(geist),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: Buffer.from(geist),
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Instrument Serif',
          data: Buffer.from(instrumentSerif),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Instrument Serif',
          data: Buffer.from(instrumentSerifItalic),
          weight: 400,
          style: 'italic',
        },
        {
          name: 'JetBrains Mono',
          data: Buffer.from(jetbrainsMono),
          weight: 500,
          style: 'normal',
        },
      ],
    })
  } catch (error) {
    console.log(error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
