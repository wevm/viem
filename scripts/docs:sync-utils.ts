import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

// Vendors API-reference docs for `utils/` façade modules that re-export an ox
// module, by fetching ox's generated `.md` doc routes from `v1.oxlib.sh` and
// rewriting them for viem. ox and viem share authorship + MIT license, so this
// is reuse, not scraping. Re-run on every ox bump to control drift.
//
// Source routes (per module):
//   <base>.md          → overview            → docs/utilities/<slug>/index.mdx
//   <base>/<fn>.md     → per-function page   → docs/utilities/<slug>/<fn>.mdx
//   <base>/errors.md   → errors page         → docs/utilities/<slug>/errors.mdx
//   <base>/types.md    → types page          → docs/utilities/<slug>/types.mdx
//
// Pages are written as `.mdx` (Vocs only registers `.mdx`/`.tsx` files as
// routes; plain `.md` is processed but never routed).
//
// Hand-authored helper pages (viem-only exports like `recoverAddress`) live
// in-tree alongside the generated pages at `docs/utilities/<slug>/<helper>.mdx`.
// They are preserved across the regenerate-from-scratch wipe and committed; the
// generated pages are ignored via a generated `docs/utilities/.gitignore`.

const origin = 'https://v1.oxlib.sh'
const srcUtilsDir = join(import.meta.dirname, '../src/utils')
const outDir = join(import.meta.dirname, '../site/pages/docs/utilities')
const sidebarPath = join(import.meta.dirname, '../site/sidebar.generated.ts')

type Augmented = {
  /** ox doc route base override (when the ox doc module name differs). */
  route?: string
  /** `[oxNamespace, viemNamespace]` rename applied to vendored content. */
  alias?: [string, string]
  /** viem-only exports documented as extra (hand-authored) pages, in order. */
  helpers: string[]
}

/**
 * Modules that augment the ox re-export with viem-authored helpers
 * (e.g. `recoverAddress`, `verify`). Their ox surface is vendored like any
 * other façade; the listed helpers are hand-authored pages kept in-tree at
 * `docs/utilities/<slug>/<helper>.mdx`, preserved across the wipe, and merged
 * into the overview + sidebar.
 */
const augmented: Record<string, Augmented> = {
  Authorization: { helpers: ['recoverAddress', 'verify'] },
  Json: { helpers: ['prettyPrint'] },
  PersonalMessage: { helpers: ['recoverAddress', 'verify'] },
  TypedData: { helpers: ['recoverAddress', 'verify'] },
  TxEnvelope: {
    route: '/api/TransactionEnvelope',
    alias: ['TransactionEnvelope', 'TxEnvelope'],
    helpers: ['recoverAddress'],
  },
}

/**
 * ox import path → ox doc route base (when it differs from `/api/<M>`).
 *
 * Note: the core `Transaction`, `TransactionReceipt`, and `TransactionRequest`
 * modules have no public ox doc page (`/tempo/reference/*` documents the
 * tempo-flavored variants, not these), so they fall through to `/api/<M>`,
 * 404, and are skipped.
 */
const overrides: Record<string, string> = {
  'erc6492/SignatureErc6492': '/ercs/erc6492/SignatureErc6492',
  'erc8010/SignatureErc8010': '/ercs/erc8010/SignatureErc8010',
}

/**
 * Module → sidebar category, mirroring ox's `@category` grouping so the
 * Utilities sidebar nests Category › Module › pages. Categories sort
 * alphabetically, interleaved with the root modules below. Modules absent from
 * this map and from `rootModules` fall back to "Other".
 */
const categories: Record<string, string> = {
  Abi: 'ABI',
  AbiConstructor: 'ABI',
  AbiError: 'ABI',
  AbiEvent: 'ABI',
  AbiFunction: 'ABI',
  AbiItem: 'ABI',
  AbiParameters: 'ABI',
  Address: 'Addresses',
  ContractAddress: 'Addresses',
  Ens: 'ENS',
  Authorization: 'Authorization (EIP-7702)',
  Blobs: 'Blobs (EIP-4844)',
  BlobCells: 'Blobs (EIP-4844)',
  Kzg: 'Blobs (EIP-4844)',
  Hash: 'Crypto',
  HdKey: 'Crypto',
  Mnemonic: 'Crypto',
  Bytes: 'Encoding',
  Hex: 'Encoding',
  Json: 'Encoding',
  Rlp: 'Encoding',
  Value: 'Encoding',
  PublicKey: 'Keys & Signatures',
  Secp256k1: 'Keys & Signatures',
  Signature: 'Keys & Signatures',
  SignatureErc6492: 'Keys & Signatures',
  SignatureErc8010: 'Keys & Signatures',
  PersonalMessage: 'Signed & Typed Data',
  TypedData: 'Signed & Typed Data',
  TxEnvelope: 'Transaction Envelopes',
  TxEnvelopeEip1559: 'Transaction Envelopes',
  TxEnvelopeEip2930: 'Transaction Envelopes',
  TxEnvelopeEip4844: 'Transaction Envelopes',
  TxEnvelopeEip7702: 'Transaction Envelopes',
  TxEnvelopeLegacy: 'Transaction Envelopes',
}

/**
 * Modules surfaced directly at the Utilities root instead of nested under a
 * category. They sort alphabetically (by sidebar label) alongside the category
 * groups.
 */
const rootModules = new Set([
  'AccessList',
  'AccountProof',
  'Block',
  'BlockOverrides',
  'Fee',
  'Filter',
  'Log',
  'StateOverrides',
  'Transaction',
  'TransactionReceipt',
  'TransactionRequest',
  'Withdrawal',
  'Siwe',
])

/** Sidebar label overrides (module name → displayed text). */
const labels: Record<string, string> = {
  Siwe: 'Siwe (Sign-in with Ethereum)',
}

type Module = {
  name: string
  slug: string
  routeBase: string
  alias?: [string, string] | undefined
  helpers: string[]
}

/** Scans `src/utils/*.ts` for `export * from 'ox/<path>'` façade modules. */
function discoverModules(): Module[] {
  const modules: Module[] = []
  for (const file of readdirSync(srcUtilsDir).sort()) {
    if (!file.endsWith('.ts')) continue
    if (file.endsWith('.test.ts') || file.endsWith('.test-d.ts')) continue
    if (file === 'index.ts') continue

    const name = file.replace(/\.ts$/, '')
    const source = readFileSync(join(srcUtilsDir, file), 'utf8')
    const match = source.match(/export \* from 'ox\/([^']+)'/)
    if (!match) continue

    const oxPath = match[1]!
    const config = augmented[name]
    const routeBase = config?.route ?? overrides[oxPath] ?? `/api/${oxPath}`
    modules.push({
      name,
      slug: name.toLowerCase(),
      routeBase,
      alias: config?.alias,
      helpers: config?.helpers ?? [],
    })
  }
  return modules
}

/**
 * Caps concurrent fetches against the ox docs origin. A global limiter (rather
 * than per-level pools) lets us fan out freely at both the module and page
 * level while keeping total requests in flight bounded.
 */
function createLimiter(max: number) {
  let active = 0
  const queue: (() => void)[] = []
  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= max) await new Promise<void>((resolve) => queue.push(resolve))
    active++
    try {
      return await fn()
    } finally {
      active--
      queue.shift()?.()
    }
  }
}

const limit = createLimiter(12)

async function fetchMd(route: string): Promise<string | null> {
  return limit(async () => {
    const res = await fetch(`${origin}${route}.md`)
    if (!res.ok) return null
    return res.text()
  })
}

/** Builds a route → viem-docs path map for link rewriting (longest first). */
function buildLinkMap(modules: Module[]) {
  return modules
    .map((m) => ({
      from: m.routeBase,
      to: `/docs/utilities/${m.slug}`,
    }))
    .sort((a, b) => b.from.length - a.from.length)
}

function transform(
  markdown: string,
  linkMap: { from: string; to: string }[],
  alias?: [string, string],
) {
  let out = markdown

  // 1. Collapse `:::code-group` (Named / Entrypoint tabs) to the Named block.
  out = out.replace(/:::code-group\n([\s\S]*?)\n:::/g, (_, body: string) => {
    const block = body.match(/```ts(?: \[[^\]]*\])?\n([\s\S]*?)```/)
    if (!block) return body
    return `\`\`\`ts\n${block[1]}\`\`\``
  })

  // 2. Rewrite imports inside code blocks: ox → viem/utils (namespaces live
  // on the utils entrypoint).
  out = out.replace(
    /import \* as (\w+) from 'ox\/[^']+'/g,
    "import { $1 } from 'viem/utils'",
  )
  out = out.replace(/from 'ox\/[^']+'/g, "from 'viem/utils'")
  out = out.replace(/from 'ox'/g, "from 'viem/utils'")

  // 3. Rewrite doc links: ox routes → viem docs; unknown ox routes → absolute.
  for (const { from, to } of linkMap)
    out = out.replaceAll(
      new RegExp(`(?<=[(\\s])${escapeRegExp(from)}(?=[/)#])`, 'g'),
      to,
    )
  out = out.replace(
    /(?<=[(\s])(\/(?:api|ercs|tempo)\/[^)\s#]*)/g,
    `${origin}$1`,
  )

  // 4. Drop ox source links.
  out = out.replace(/^\*\*Source:\*\* \[[^\]]*\]\([^)]*\)\n?/gm, '')

  // 5. Suppress type-checking on vendored twoslash blocks. ox's examples
  // import sibling ox modules viem doesn't surface on its root and can drift
  // from viem's pinned ox version, so re-checking them here is unreliable.
  // `// @noErrors` keeps twoslash rendering (`// @log:` annotations, hovers)
  // without failing the build.
  out = out.replace(
    /```ts twoslash\n(?!\/\/ @noErrors)/g,
    '```ts twoslash\n// @noErrors\n',
  )

  // 6. Rename the ox namespace to the viem one (e.g. `TransactionEnvelope` →
  // `TxEnvelope`). Runs after link rewriting so route paths are already mapped.
  // Also rewrite the lowercased slug form so heading anchors (e.g.
  // `#transactionenvelopebase` → `#txenvelopebase`) stay in sync with the
  // renamed headings — Vocs slugifies the visible (renamed) heading text.
  if (alias) {
    const [from, to] = alias
    out = out.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, 'g'), to)
    // Guard the slug rewrite so it never shortens a longer sibling slug
    // (e.g. `transactionenvelopeeip1559`, whose module keeps the ox name).
    out = out.replace(
      new RegExp(`${escapeRegExp(from.toLowerCase())}(?!eip|legacy)`, 'g'),
      to.toLowerCase(),
    )
  }

  // 7. Tidy excess blank lines introduced by removals.
  out = out.replace(/\n{3,}/g, '\n\n')

  return out.trimStart()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function banner(sourceUrl: string) {
  return `{/*\n  AUTOGENERATED by \`pnpm docs:sync-utils\` — do not edit by hand.\n  Source: ${sourceUrl}\n*/}\n\n`
}

/** Builds the `:::info` callout flagging the page as an ox re-export. */
function reExportInfo(symbol: string, oxSymbol: string, route: string) {
  return `:::info\n\`${symbol}\` is a re-export of ox's [\`${oxSymbol}\`](${origin}${route}). Refer to the ox documentation for the full reference.\n:::`
}

/** Inserts the re-export callout directly under the page's `# ` heading. */
function withInfo(content: string, info: string) {
  const lines = content.split('\n')
  const index = lines.findIndex((line) => line.startsWith('# '))
  if (index === -1) return `${info}\n\n${content}`
  lines.splice(index + 1, 0, '', info)
  return lines.join('\n')
}

/** Extracts per-function slugs from the overview Functions table links. */
function extractFunctionSlugs(overview: string, routeBase: string) {
  const re = new RegExp(`\\(${escapeRegExp(routeBase)}/([a-zA-Z0-9]+)\\)`, 'g')
  const slugs = new Set<string>()
  for (const match of overview.matchAll(re)) {
    const slug = match[1]!
    if (slug === 'errors' || slug === 'types') continue
    slugs.add(slug)
  }
  return [...slugs]
}

async function syncModule(
  module: Module,
  linkMap: { from: string; to: string }[],
  helperPages: Map<string, string>,
) {
  const { name, slug, routeBase, alias, helpers } = module
  const overview = await fetchMd(routeBase)
  if (!overview) return { name, ok: false as const }

  const viemNs = name
  const oxNs = alias?.[0] ?? name

  const moduleDir = join(outDir, slug)
  mkdirSync(moduleDir, { recursive: true })

  const write = (
    file: string,
    route: string,
    symbol: string,
    oxSymbol: string,
    content: string,
  ) =>
    writeFileSync(
      join(moduleDir, file),
      banner(`${origin}${route}.md`) +
        withInfo(
          transform(content, linkMap, alias),
          reExportInfo(symbol, oxSymbol, route),
        ),
    )

  // Fetch all per-function + errors/types pages concurrently (the global
  // limiter bounds total requests), then write in a stable order.
  const slugs = [
    ...extractFunctionSlugs(overview, routeBase),
    'errors',
    'types',
  ]
  const pages = await Promise.all(
    slugs.map((s) => fetchMd(`${routeBase}/${s}`)),
  )

  const functions: string[] = []
  const extras: ('errors' | 'types')[] = []
  slugs.forEach((s, i) => {
    const page = pages[i]
    if (!page) return
    const isExtra = s === 'errors' || s === 'types'
    const symbol = isExtra ? viemNs : `${viemNs}.${s}`
    const oxSymbol = isExtra ? oxNs : `${oxNs}.${s}`
    write(`${s}.mdx`, `${routeBase}/${s}`, symbol, oxSymbol, page)
    if (isExtra) extras.push(s)
    else functions.push(s)
  })

  // Restore the hand-authored viem-helper pages (preserved across the wipe).
  const addedHelpers: string[] = []
  for (const helper of helpers) {
    const content = helperPages.get(`${slug}/${helper}`)
    if (content === undefined) {
      console.warn(`  ! missing helper page: ${slug}/${helper}.mdx`)
      continue
    }
    writeFileSync(join(moduleDir, `${helper}.mdx`), content)
    addedHelpers.push(helper)
  }

  // Write the overview, appending a "Viem Helpers" section when helpers exist.
  const overviewOut =
    banner(`${origin}${routeBase}.md`) +
    withInfo(
      transform(overview, linkMap, alias),
      reExportInfo(viemNs, oxNs, routeBase),
    ) +
    helpersSection(name, slug, addedHelpers, helperPages)
  writeFileSync(join(moduleDir, 'index.mdx'), overviewOut)

  return {
    name,
    slug,
    routeBase,
    ok: true as const,
    functions,
    helpers: addedHelpers,
    extras,
  }
}

/** Builds a "Viem Helpers" overview section linking the authored helper pages. */
function helpersSection(
  name: string,
  slug: string,
  helpers: string[],
  helperPages: Map<string, string>,
) {
  if (!helpers.length) return ''
  const rows = helpers
    .map((helper) => {
      const source = helperPages.get(`${slug}/${helper}`) ?? ''
      const description = source
        .split('\n')
        .find((line) => line.trim() && !line.startsWith('#'))
        ?.trim()
        .replace(/\|/g, '\\|')
      return `| [\`${name}.${helper}\`](/docs/utilities/${slug}/${helper}) | ${description ?? ''} |`
    })
    .join('\n')
  return `\n## Viem Helpers\n\nFunctions added by Viem on top of the \`${name}\` module.\n\n| Name | Description |\n| ---- | ----------- |\n${rows}\n`
}

type Synced = {
  name: string
  slug: string
  routeBase: string
  functions: string[]
  helpers: string[]
  extras: ('errors' | 'types')[]
}

type SidebarItem = {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

/** Builds the per-module sidebar node (Module › Overview/functions/helpers). */
function moduleItem(m: Synced, label = m.name): SidebarItem {
  const extraText = { errors: 'Errors', types: 'Types' } as const
  const base = `/docs/utilities/${m.slug}`
  return {
    text: label,
    collapsed: true,
    items: [
      { text: 'Overview', link: base },
      ...m.functions.map((fn) => ({ text: fn, link: `${base}/${fn}` })),
      ...m.helpers.map((helper) => ({
        text: helper,
        link: `${base}/${helper}`,
      })),
      ...m.extras.map((extra) => ({
        text: extraText[extra],
        link: `${base}/${extra}`,
      })),
    ],
  }
}

/** Splits a PascalCase module name into spaced words (AccessList → Access List). */
function spaceCase(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

function writeSidebar(synced: Synced[]) {
  // Root modules sit at the Utilities top level; the rest nest under their ox
  // category (Category › Module › pages).
  const groups = new Map<string, SidebarItem[]>()
  const roots: SidebarItem[] = []
  for (const m of synced) {
    if (rootModules.has(m.name)) {
      roots.push(moduleItem(m, labels[m.name] ?? spaceCase(m.name)))
      continue
    }
    const category = categories[m.name] ?? 'Other'
    if (!(m.name in categories))
      console.warn(`  ! uncategorized module: ${m.name}`)
    const list = groups.get(category) ?? groups.set(category, []).get(category)!
    list.push(moduleItem(m))
  }

  // Category groups and root modules share one alphabetical ordering, keyed by
  // sidebar label.
  const groupItems: SidebarItem[] = [...groups.entries()].map(
    ([category, modules]) => ({
      text: category,
      collapsed: true,
      items: modules.sort((a, b) => a.text.localeCompare(b.text)),
    }),
  )
  const items = [...groupItems, ...roots].sort((a, b) =>
    a.text.localeCompare(b.text),
  )

  const tree: SidebarItem = { text: 'Utilities', collapsed: false, items }
  const content = `// AUTOGENERATED by \`pnpm docs:sync-utils\` — do not edit by hand.\nimport type { Config } from 'vocs/config'\n\ntype SidebarItem = Extract<\n  NonNullable<Config['sidebar']>,\n  readonly unknown[]\n>[number]\n\nexport const utilities = ${JSON.stringify(
    tree,
    null,
    2,
  )} satisfies SidebarItem\n`
  writeFileSync(sidebarPath, content)
}

/** Reads in-tree hand-authored helper pages into memory before the wipe. */
function readHelpers(modules: Module[]) {
  const pages = new Map<string, string>()
  for (const m of modules)
    for (const helper of m.helpers) {
      const path = join(outDir, m.slug, `${helper}.mdx`)
      if (existsSync(path))
        pages.set(`${m.slug}/${helper}`, readFileSync(path, 'utf8'))
    }
  return pages
}

/**
 * Writes `docs/utilities/.gitignore` so the regenerated API pages are ignored
 * while the hand-authored helper pages stay tracked. A leading `*` ignores
 * everything, a directory-negation rule re-includes folders (so git can descend
 * to reach the helpers), and each helper path is re-included explicitly — name
 * globs are unsafe, since ox has its own `verify`/`recoverAddress` pages.
 */
function writeUtilitiesGitignore(modules: Module[]) {
  const helperPaths = modules
    .flatMap((m) => m.helpers.map((helper) => `!${m.slug}/${helper}.mdx`))
    .sort()
  const content = [
    '# AUTOGENERATED by `pnpm docs:sync-utils` — do not edit by hand.',
    '# Generated API pages are ignored; hand-authored helper pages are tracked.',
    '*',
    '!*/',
    '!.gitignore',
    ...helperPaths,
    '',
  ].join('\n')
  writeFileSync(join(outDir, '.gitignore'), content)
}

async function main() {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const only = onlyArg?.slice('--only='.length).split(',')

  // `--if-needed` skips the sync when the generated output is already present
  // (used by `docs:dev` to avoid re-fetching ox docs on every start).
  const ifNeeded = process.argv.includes('--if-needed')
  if (ifNeeded && existsSync(sidebarPath) && existsSync(outDir)) {
    console.log(
      'Utilities docs already synced — skipping (run `pnpm docs:sync-utils` to refresh).',
    )
    return
  }

  const allModules = discoverModules()
  const modules = only
    ? allModules.filter((m) => only.includes(m.name))
    : allModules

  const linkMap = buildLinkMap(allModules)

  // Read the hand-authored helper pages before wiping the generated tree, so
  // they survive the regenerate-from-scratch and can be written back in place.
  const helperPages = readHelpers(allModules)

  if (!only && existsSync(outDir))
    rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  // Sync modules concurrently; the global fetch limiter bounds total requests.
  // Results are kept in module order so the sidebar order stays stable.
  const results = await Promise.all(
    modules.map((module) => syncModule(module, linkMap, helperPages)),
  )

  const synced: Synced[] = []
  const skipped: string[] = []
  for (const result of results) {
    if (result.ok) {
      const { name, slug, routeBase, functions, helpers, extras } = result
      synced.push({ name, slug, routeBase, functions, helpers, extras })
      const count = 1 + functions.length + helpers.length + extras.length
      const helperNote = helpers.length ? ` +${helpers.length} helper` : ''
      console.log(`✓ ${name} (${count} pages${helperNote})`)
    } else {
      skipped.push(result.name)
      console.log(`✗ ${result.name} — no docs`)
    }
  }

  if (!only) {
    writeSidebar(synced)
    writeUtilitiesGitignore(allModules)
  }

  const pageCount = synced.reduce(
    (n, m) => n + 1 + m.functions.length + m.helpers.length + m.extras.length,
    0,
  )
  console.log(
    `\nSynced ${synced.length} modules, ${pageCount} pages.` +
      (skipped.length ? ` Skipped (no ox docs): ${skipped.join(', ')}.` : ''),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
