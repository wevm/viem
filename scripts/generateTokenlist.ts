import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from 'node:fs'
import { basename } from 'node:path'

const tokenlistUris = [
  'https://api.tempo.xyz/v1/tokenlist?chainId=4217',
  'https://api.tempo.xyz/v1/tokenlist?chainId=42431',
]

type ChainTarget = {
  chainId: number
  file: URL
  name: string
}

type ChainExport = {
  exportedName: string
  file: URL
}

type TokenlistToken = {
  address: string
  chainId: number
  decimals: number
  logoURI?: string | undefined
  name: string
  symbol: string
}

type Tokenlist = {
  keywords?: string[] | undefined
  logoURI?: string | undefined
  name: string
  timestamp: string
  tokens: TokenlistToken[]
  version: {
    major: number
    minor: number
    patch: number
  }
}

type TokenDefinition = {
  addresses: Map<number, string>
  decimals: number
  importName: string
  name: string
  sourceOrder: number
  symbol: string
}

const generatedBanner =
  '// Generated with `pnpm gen:tokenlist`. Do not modify manually.'

const definitionsDir = new URL('../src/tokens/definitions/', import.meta.url)
const tokensIndexFile = new URL('../src/tokens/index.ts', import.meta.url)
const chainsIndexFile = new URL('../src/chains/index.ts', import.meta.url)

const tokenDefinitions = await getTokenDefinitions(
  tokenlistUris,
  getReservedImportNames(),
)
const tokenChainIds = new Set(
  tokenDefinitions.flatMap((token) => Array.from(token.addresses.keys())),
)
const chainTargetById = await getChainTargetById(tokenChainIds)
const unsupportedChainIds = Array.from(tokenChainIds).filter(
  (chainId) => !chainTargetById.has(chainId),
)
if (unsupportedChainIds.length > 0)
  throw new Error(
    `Missing chain target for tokenlist chain id(s): ${unsupportedChainIds.join(', ')}.`,
  )

await writeTokenDefinitions(tokenDefinitions)
await writeTokensIndex(tokenDefinitions)
for (const target of chainTargetById.values())
  await updateChainTokens(target, tokenDefinitions)

console.log(
  `Synced ${tokenDefinitions.length} token definitions from ${tokenlistUris.length} tokenlist URI(s) across ${tokenChainIds.size} chain(s).`,
)

async function getTokenDefinitions(
  tokenlistUris: string[],
  reservedImportNames: Set<string>,
) {
  const tokens = (
    await Promise.all(
      tokenlistUris.map(async (uri) =>
        fetchTokenlist(uri).then((tokenlist) => tokenlist.tokens),
      ),
    )
  ).flat()

  const tokenGroups = new Map<string, TokenDefinition>()
  let sourceOrder = 0
  for (const token of tokens) {
    const key = `${token.symbol}:${token.name}:${token.decimals}`
    const group = tokenGroups.get(key) ?? {
      addresses: new Map<number, string>(),
      decimals: token.decimals,
      importName: '',
      name: token.name,
      sourceOrder: sourceOrder++,
      symbol: token.symbol,
    }

    const existing = group.addresses.get(token.chainId)
    if (existing && existing.toLowerCase() !== token.address.toLowerCase())
      throw new Error(
        `Duplicate token ${token.symbol} on chain ${token.chainId}: ${existing} and ${token.address}.`,
      )

    group.addresses.set(token.chainId, token.address)
    tokenGroups.set(key, group)
  }

  const usedImportNames = new Set(reservedImportNames)
  return Array.from(tokenGroups.values())
    .sort((a, b) => a.sourceOrder - b.sourceOrder)
    .map((token) => ({
      ...token,
      importName: getUniqueImportName(token, usedImportNames),
    }))
}

async function fetchTokenlist(uri: string): Promise<Tokenlist> {
  const response = await fetch(uri)
  if (!response.ok)
    throw new Error(
      `Failed to fetch ${uri}: ${response.status} ${response.statusText}`,
    )

  const tokenlist = (await response.json()) as unknown
  assertTokenlist(tokenlist, uri)
  return tokenlist
}

async function getChainTargetById(chainIds: Set<number>) {
  const chainExports = getChainExports()
  const chains = (await import(chainsIndexFile.href)) as Record<string, unknown>
  const chainTargetById = new Map<number, ChainTarget>()

  for (const chainExport of chainExports) {
    const chain = chains[chainExport.exportedName]
    if (!isChain(chain)) continue
    if (!chainIds.has(chain.id)) continue
    if (chainTargetById.has(chain.id)) continue
    chainTargetById.set(chain.id, {
      chainId: chain.id,
      file: chainExport.file,
      name: chainExport.exportedName,
    })
  }

  return chainTargetById
}

function getChainExports() {
  const source = readFileSync(chainsIndexFile, 'utf8')
  const chainExports: ChainExport[] = []
  const exportPattern =
    /export\s*\{([\s\S]*?)\}\s*from\s*'(\.\/definitions\/[^']+\.js)'/g

  for (const match of source.matchAll(exportPattern)) {
    const specifiers = match[1]!
    const modulePath = match[2]!
    const file = new URL(modulePath.replace(/\.js$/, '.ts'), chainsIndexFile)

    for (const exportedName of getExportedNames(specifiers))
      chainExports.push({ exportedName, file })
  }

  return chainExports
}

function getExportedNames(specifiers: string) {
  return specifiers
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean)
    .map((specifier) =>
      specifier
        .split(/\s+as\s+/)
        .at(-1)!
        .trim(),
    )
}

async function writeTokenDefinitions(tokenDefinitions: TokenDefinition[]) {
  mkdirSync(definitionsDir, { recursive: true })

  const generatedFiles = new Set(
    tokenDefinitions.map((token) => `${token.importName}.ts`),
  )

  for (const fileName of readdirSync(definitionsDir)) {
    if (!fileName.endsWith('.ts')) continue
    if (generatedFiles.has(fileName)) continue

    const file = new URL(fileName, definitionsDir)
    if (hasGeneratedBanner(readFileSync(file, 'utf8'))) unlinkSync(file)
  }

  await Promise.all(
    tokenDefinitions.map((token) =>
      Bun.write(
        new URL(`${token.importName}.ts`, definitionsDir),
        getTokenDefinitionSource(token),
      ),
    ),
  )
}

async function writeTokensIndex(tokenDefinitions: TokenDefinition[]) {
  const definitionExports = getDefinitionExports(tokenDefinitions)

  await Bun.write(
    tokensIndexFile,
    `// biome-ignore lint/performance/noBarrelFile: entrypoint module
export { defineToken, type Token } from './defineToken.js'
${definitionExports.map((name) => `export { ${name} } from './definitions/${name}.js'`).join('\n')}
`,
  )
}

async function updateChainTokens(
  target: ChainTarget,
  tokenDefinitions: TokenDefinition[],
) {
  const { chainId, file } = target
  const tokens = tokenDefinitions.filter((token) =>
    token.addresses.has(chainId),
  )
  const tokensBlock = `  tokens: {
${tokens.map((token) => getChainTokenSource(token, chainId)).join('\n')}
  },`

  const source = readFileSync(file, 'utf8')
  const withoutTokenImports = source.replace(
    /^import \{ \w+ \} from '\.\.\/\.\.\/tokens\/definitions\/\w+\.js'\n/gm,
    '',
  )
  const withoutHelper = withoutTokenImports
    .replace(
      /^import type \{ ChainToken \} from '\.\.\/\.\.\/types\/chain\.js'\n/gm,
      '',
    )
    .replace(/\nfunction chainToken\([\s\S]*?\n\}\n(?=\nexport const)/m, '')

  const withTokensBlock = /\n {2}tokens: \{[\s\S]*?\n {2}\},(?=\n\}\))/m.test(
    withoutHelper,
  )
    ? withoutHelper.replace(
        /\n {2}tokens: \{[\s\S]*?\n {2}\},(?=\n\}\))/m,
        `\n${tokensBlock}`,
      )
    : withoutHelper.replace(/\n\}\)\n?$/, `\n${tokensBlock}\n})\n`)

  await Bun.write(file, withTokensBlock)
}

function getChainTokenSource(token: TokenDefinition, chainId: number) {
  return `    ${token.importName}: {
      address: '${token.addresses.get(chainId)!}',
      decimals: ${token.decimals},
      name: ${toStringLiteral(token.name)},
      symbol: ${toStringLiteral(token.symbol)},
    },`
}

function getTokenDefinitionSource(token: TokenDefinition) {
  const addresses = Array.from(token.addresses.entries())
    .sort(([chainIdA], [chainIdB]) => chainIdA - chainIdB)
    .map(([chainId, address]) => {
      const target = chainTargetById.get(chainId)
      const comment = target ? ` // ${target.name}` : ''
      return `    ${chainId}: '${address}',${comment}`
    })
    .join('\n')
  return `${generatedBanner}

import { defineToken } from '../defineToken.js'

export const ${token.importName} = /*#__PURE__*/ defineToken({
  addresses: {
${addresses}
  },
  decimals: ${token.decimals},
  name: ${toStringLiteral(token.name)},
  symbol: ${toStringLiteral(token.symbol)},
})
`
}

function toStringLiteral(value: string) {
  return `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')}'`
}

function getDefinitionExports(tokenDefinitions: TokenDefinition[]) {
  const generatedExports = tokenDefinitions.map((token) => token.importName)
  const existingExports = readdirSync(definitionsDir)
    .filter(
      (fileName) => fileName.endsWith('.ts') && !fileName.endsWith('.test.ts'),
    )
    .map((fileName) => basename(fileName, '.ts'))
  return Array.from(new Set([...existingExports, ...generatedExports])).sort(
    (a, b) => a.localeCompare(b),
  )
}

function getReservedImportNames() {
  if (!existsSync(definitionsDir)) return new Set<string>()

  return new Set(
    readdirSync(definitionsDir)
      .filter(
        (fileName) =>
          fileName.endsWith('.ts') && !fileName.endsWith('.test.ts'),
      )
      .filter((fileName) => {
        const file = new URL(fileName, definitionsDir)
        return !hasGeneratedBanner(readFileSync(file, 'utf8'))
      })
      .map((fileName) => basename(fileName, '.ts')),
  )
}

function hasGeneratedBanner(source: string) {
  return source.includes(generatedBanner)
}

function getUniqueImportName(
  token: Pick<TokenDefinition, 'name' | 'symbol'>,
  usedImportNames: Set<string>,
) {
  const base = toIdentifier(token.symbol)
  let importName = base
  if (usedImportNames.has(importName)) importName = toIdentifier(token.name)
  let index = 2
  while (usedImportNames.has(importName)) importName = `${base}${index++}`
  usedImportNames.add(importName)
  return importName
}

function toIdentifier(value: string) {
  const identifier = value.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()

  if (!identifier)
    throw new Error(`Could not derive token import name from "${value}".`)
  if (/^\d/.test(identifier)) return `token${identifier}`
  return identifier
}

function assertTokenlist(
  value: unknown,
  uri: string,
): asserts value is Tokenlist {
  if (!isRecord(value))
    throw new Error(`Tokenlist response from ${uri} must be an object.`)
  if (typeof value.name !== 'string' || value.name.length === 0)
    throw new Error(`Tokenlist response from ${uri} must include a name.`)
  if (typeof value.timestamp !== 'string' || value.timestamp.length === 0)
    throw new Error(`Tokenlist response from ${uri} must include a timestamp.`)
  if (!isRecord(value.version))
    throw new Error(`Tokenlist response from ${uri} must include a version.`)
  for (const key of ['major', 'minor', 'patch'] as const) {
    if (!Number.isInteger(value.version[key]))
      throw new Error(
        `Tokenlist response from ${uri} must include version.${key}.`,
      )
  }
  if (!Array.isArray(value.tokens))
    throw new Error(
      `Tokenlist response from ${uri} must include a tokens array.`,
    )

  for (const token of value.tokens) {
    if (!isRecord(token))
      throw new Error(`Tokenlist token from ${uri} must be an object.`)
    if (!Number.isInteger(token.chainId))
      throw new Error(`Invalid token chain id from ${uri}.`)
    if (typeof token.address !== 'string' || !isAddress(token.address))
      throw new Error(
        `Invalid token address from ${uri}: ${String(token.address)}.`,
      )
    const decimals = token.decimals
    if (
      typeof decimals !== 'number' ||
      !Number.isInteger(decimals) ||
      decimals < 0
    )
      throw new Error(
        `Invalid token decimals from ${uri} for ${token.address}.`,
      )
    if (typeof token.name !== 'string' || token.name.length === 0)
      throw new Error(`Invalid token name from ${uri} for ${token.address}.`)
    if (typeof token.symbol !== 'string' || token.symbol.length === 0)
      throw new Error(`Invalid token symbol from ${uri} for ${token.address}.`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChain(value: unknown): value is { id: number } {
  return isRecord(value) && Number.isInteger(value.id)
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}
