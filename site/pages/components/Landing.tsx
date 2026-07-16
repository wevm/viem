'use client'

import IconArrowUpRight from '~icons/lucide/arrow-up-right'
import IconBlocks from '~icons/lucide/blocks'
import IconBoxes from '~icons/lucide/boxes'
import IconCable from '~icons/lucide/cable'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconZap from '~icons/lucide/zap'
import IconBun from '~icons/vscode-icons/file-type-bun'
import IconNpm from '~icons/vscode-icons/file-type-npm'
import IconPnpm from '~icons/vscode-icons/file-type-pnpm'
import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useState,
} from 'react'
import { Link } from 'vocs'

type Pkg = 'npm' | 'pnpm' | 'bun'

export type LandingProps = {
  installCommands: Record<Pkg, string>
  installHtml: Record<Pkg, string>
  snippet?: ReactNode
}

const AGENT_PROMPT = `Read viem.sh and help me build my project with Viem. Add https://viem.sh/api/mcp as an MCP server.`

// Package-manager icons for the install tabs.
const pkgIcons: Record<Pkg, ReactNode> = {
  npm: <IconNpm aria-hidden className="h-3.5 w-3.5" />,
  pnpm: <IconPnpm aria-hidden className="h-3.5 w-3.5" />,
  bun: <IconBun aria-hidden className="h-3.5 w-3.5" />,
}

// Background-image used for dashed horizontal/vertical lines.
const dashedH = {
  backgroundImage:
    'repeating-linear-gradient(to right, var(--border-color-hover) 0 3px, transparent 3px 6px)',
  backgroundSize: '100% 1px',
  backgroundRepeat: 'no-repeat',
}
const dashedFrame = {
  backgroundImage: [
    'repeating-linear-gradient(to right, var(--border-color-hover) 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(to right, var(--border-color-hover) 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(to bottom, var(--border-color-hover) 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(to bottom, var(--border-color-hover) 0 3px, transparent 3px 6px)',
  ].join(','),
  backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
  backgroundPosition: 'left top, left bottom, left top, right top',
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
}

type ModuleId = 'clients' | 'chains' | 'transports' | 'actions'

type Module = {
  id: ModuleId
  name: string
  desc: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  docHref: string
}

const modules: Module[] = [
  {
    id: 'clients',
    name: 'Client',
    icon: IconBoxes,
    desc: 'Compose a Chain, Transport, Account, and only the Actions your application needs.',
    docHref: '/docs/clients',
  },
  {
    id: 'chains',
    name: 'Chain',
    icon: IconBlocks,
    desc: 'Use typed definitions for Ethereum networks, contracts, fees, and RPC endpoints.',
    docHref: '/docs/chains',
  },
  {
    id: 'transports',
    name: 'Transport',
    icon: IconCable,
    desc: 'Connect a Client to HTTP, WebSocket, custom, or fallback Ethereum providers.',
    docHref: '/docs/transports',
  },
  {
    id: 'actions',
    name: 'Actions',
    icon: IconZap,
    desc: 'Extend a Client with predictable, namespaced methods for reading state, sending transactions, and interacting with wallets.',
    docHref: '/docs/actions',
  },
]

const containerCls =
  'mx-auto w-full max-w-[var(--max-w)] px-[var(--container-pad)]'

export function Landing({
  installCommands,
  installHtml,
  snippet,
}: LandingProps) {
  const [pkg, setPkg] = useState<Pkg>('npm')
  const [active, setActive] = useState(modules[0]!.id)
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedAgent, setCopiedAgent] = useState(false)

  function copyInstall() {
    navigator.clipboard.writeText(installCommands[pkg])
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2000)
  }
  function copyAgent() {
    navigator.clipboard.writeText(AGENT_PROMPT)
    setCopiedAgent(true)
    setTimeout(() => setCopiedAgent(false), 2000)
  }
  function conceptLink(id: ModuleId, label: string) {
    const isActive = active === id
    return (
      <button
        type="button"
        aria-controls="module-example"
        aria-pressed={isActive}
        onClick={() => setActive(id)}
        className={
          'cursor-pointer border-0 border-b border-dashed bg-transparent p-0 font-[inherit] transition-colors ' +
          (isActive
            ? 'border-accent text-accent'
            : 'border-hover text-primary hover:border-accent hover:text-accent')
        }
      >
        {label}
      </button>
    )
  }

  const activeIndex = Math.max(
    0,
    modules.findIndex((m) => m.id === active),
  )
  const activeModule = modules[activeIndex]!
  const ActiveIcon = activeModule.icon
  function go(offset: number) {
    const next = (activeIndex + offset + modules.length) % modules.length
    setActive(modules[next]!.id)
  }

  return (
    <div className="landing-pattern text-primary font-sans">
      <header className="pb-4">
        <div className={`flex items-center justify-between ${containerCls}`}>
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Viem" className="inline-flex items-center">
              <img
                src="/icon-light.png"
                alt="Viem"
                width={28}
                height={28}
                className="block h-7 w-auto dark:hidden"
              />
              <img
                src="/icon-dark.png"
                alt="Viem"
                width={28}
                height={28}
                className="hidden h-7 w-auto dark:block"
              />
            </a>
            <span className="text-[13px] text-muted">
              by{' '}
              <a
                href="https://wevm.dev"
                className="text-muted no-underline transition-colors hover:text-primary"
              >
                Wevm
              </a>
            </span>
          </div>
          <a
            href="/docs"
            className="inline-flex items-center gap-1.5 border border-dashed border-hover bg-elevated px-3 py-1.5 text-[13px] font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            Docs
            <IconArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden pt-12 pb-8 text-left">
        <div className={`relative z-10 ${containerCls}`}>
          <div className="max-w-[900px]">
            <h1 className="m-0 mb-3 font-display text-[clamp(36px,4.5vw,56px)] font-medium leading-none tracking-[-0.025em]">
              Ethereum Interface
              <br />
              <em className="font-normal italic text-accent">
                for Humans &amp; Agents
              </em>
            </h1>
            <p className="m-0 mb-5 max-w-[620px] text-[18px] leading-[1.55] text-secondary">
              Build software on Ethereum faster with a clear &amp; reliable
              interface that developers and AI agents can confidently navigate
              and use.
            </p>
            <div className="mb-10 flex max-w-[600px] flex-wrap gap-3">
              <Link
                to="/docs"
                style={{ color: 'var(--background-color-primary)' }}
                className="landing-primary-cta group inline-flex items-center gap-2 border border-dashed border-[var(--text-color-primary)] bg-[var(--text-color-primary)] px-[22px] py-3 text-[14px] font-semibold transition hover:bg-[var(--text-color-strong)]"
              >
                Read the docs
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a
                href="https://github.com/wevm/viem"
                className="inline-flex items-center gap-2 border border-dashed border-primary bg-elevated px-[22px] py-3 text-[14px] font-medium text-primary transition hover:border-hover hover:bg-surface"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                GitHub
              </a>
            </div>

            {/* Install row */}
            <div className="mb-8 flex max-w-[600px] flex-wrap items-stretch gap-3">
              <div className="flex w-full min-w-0 flex-[1_1_100%] flex-col border border-dashed border-hover bg-code">
                <div className="relative flex items-stretch border-b border-dashed border-hover px-1">
                  {(Object.keys(installCommands) as Pkg[]).map((p) => {
                    const isActive = pkg === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPkg(p)}
                        data-active={isActive ? '' : undefined}
                        className={
                          '-mb-px inline-flex cursor-pointer items-center gap-2 border-b-2 border-solid bg-transparent px-3.5 pt-2 pb-[6px] text-[13px] font-medium transition-colors ' +
                          (isActive
                            ? 'border-accent text-primary'
                            : 'border-transparent text-muted hover:text-primary')
                        }
                      >
                        <span aria-hidden="true" className="inline-flex">
                          {pkgIcons[p]}
                        </span>
                        {p}
                      </button>
                    )
                  })}
                </div>
                <div className="relative">
                  <div
                    className="install-shiki [&_pre]:m-0 [&_pre]:whitespace-pre [&_pre]:bg-transparent! [&_pre]:px-5 [&_pre]:py-[18px] [&_pre]:font-mono [&_pre]:text-[14px]"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: pre-rendered at build time by shiki
                    dangerouslySetInnerHTML={{ __html: installHtml[pkg] }}
                  />
                  <button
                    type="button"
                    onClick={copyInstall}
                    aria-label="Copy install command"
                    className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-muted transition-colors hover:text-primary"
                  >
                    {copiedInstall ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={copyAgent}
                className="flex h-11 w-full flex-[1_1_100%] cursor-pointer items-center justify-start gap-2.5 border border-dashed border-hover bg-elevated px-[18px] text-[13px] font-medium text-primary transition hover:border-hover hover:bg-surface"
              >
                <span
                  className={
                    'inline-block h-[7px] w-[7px] ' +
                    (copiedAgent
                      ? 'bg-success shadow-[0_0_8px_rgba(74,222,128,0.4)]'
                      : 'bg-accent shadow-[0_0_8px_var(--accent-glow)]')
                  }
                />
                <span>
                  {copiedAgent
                    ? 'Copied to clipboard'
                    : 'Copy setup instructions for agent'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="modules"
        className="bg-no-repeat pt-16 pb-24"
        style={{ ...dashedH, backgroundPosition: 'left bottom' }}
      >
        <div className={containerCls}>
          <div className="mb-16 max-w-[720px]">
            <h2 className="m-0 mb-4 font-display text-[clamp(32px,4vw,48px)] font-medium leading-[1.05] tracking-[-0.025em]">
              <em className="font-normal italic text-accent">Four concepts</em>{' '}
              to build anything.
            </h2>
            <p className="m-0 text-[18px] leading-[1.55] text-secondary">
              A {conceptLink('clients', 'Client')} connects to a{' '}
              {conceptLink('chains', 'Chain')} through a{' '}
              {conceptLink('transports', 'Transport')}.{' '}
              {conceptLink('actions', 'Actions')} provide the functionality to
              read state, send transactions, and interact with wallets.
            </p>
          </div>
          <div
            className="relative mx-0 grid grid-cols-[200px_1fr] bg-elevated max-md:grid-cols-1 lg:-mx-[4em]"
            style={dashedFrame}
          >
            <div
              role="group"
              aria-label="Module examples"
              className="flex flex-col"
            >
              {modules.map((m, i) => {
                const isActive = active === m.id
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-controls="module-example"
                    aria-pressed={isActive}
                    onClick={() => setActive(m.id)}
                    className={
                      'group relative flex cursor-pointer items-center gap-2.5 border-none bg-transparent pr-[var(--container-pad)] pl-4 py-4 text-left font-mono text-[14px] font-medium transition-colors ' +
                      (isActive
                        ? 'bg-elevated text-primary'
                        : 'text-secondary hover:text-primary')
                    }
                  >
                    <Icon
                      aria-hidden
                      className={
                        'h-4 w-4 shrink-0 transition-opacity ' +
                        (isActive
                          ? 'text-accent opacity-100'
                          : 'opacity-50 group-hover:opacity-100')
                      }
                    />
                    {m.name}
                    {i < modules.length - 1 && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-no-repeat"
                        style={dashedH}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            <div
              id="module-example"
              className="relative min-w-0"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-no-repeat max-md:top-0 max-md:right-0 max-md:bottom-auto max-md:h-px max-md:w-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, var(--border-color-hover) 0 3px, transparent 3px 6px)',
                  backgroundSize: '1px 100%',
                }}
              />
              <div className="relative flex items-center justify-between gap-3 px-4 py-[14.5px]">
                <div className="flex items-center gap-3">
                  <h3 className="m-0 flex items-center gap-2.5 font-mono text-[15px] font-semibold text-primary">
                    <ActiveIcon
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-accent"
                    />
                    {activeModule.name}
                  </h3>
                  <a
                    href={activeModule.docHref}
                    className="inline-flex items-center gap-1 border border-dashed border-hover bg-transparent px-2 py-[3px] text-[11px] font-medium text-secondary no-underline transition-colors hover:border-primary hover:text-primary"
                  >
                    Learn more
                    <IconArrowUpRight aria-hidden className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous module"
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center border border-dashed border-hover bg-transparent text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    <IconChevronLeft aria-hidden className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next module"
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center border border-dashed border-hover bg-transparent text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    <IconChevronRight aria-hidden className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-no-repeat"
                  style={dashedH}
                />
              </div>
              <div className="px-4 py-4">
                <p className="m-0 mb-4 text-[14px] leading-[1.55] text-secondary">
                  {activeModule.desc}
                </p>
                <div
                  data-active-module={activeModule.id}
                  className="module-snippet [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:border [&_pre]:border-dashed [&_pre]:border-hover [&_pre]:bg-code [&_pre]:px-0 [&_pre]:py-[18px] [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-[1.65]"
                >
                  {snippet}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="bg-no-repeat pt-14 pb-10"
        style={{ ...dashedH, backgroundPosition: 'left top' }}
      >
        <div className={containerCls}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted">
            <span>© 2026 wevm. Released under the MIT license.</span>
            <div className="flex gap-3.5">
              {[
                {
                  href: 'https://github.com/wevm/viem',
                  label: 'GitHub',
                  path: 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z',
                  size: 14,
                },
                {
                  href: 'https://x.com/wevm_dev',
                  label: 'Twitter / X',
                  path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                  size: 13,
                },
                {
                  href: 'https://discord.gg/xCUz9FRcXD',
                  label: 'Discord',
                  path: 'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
                  size: 14,
                },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex h-8 w-8 items-center justify-center border border-dashed border-hover bg-elevated text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  <svg
                    width={s.size}
                    height={s.size}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
