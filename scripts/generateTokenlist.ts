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

const tip20CurrencyData = '0xe5a6b10f'
const tempoMetadataChainIds = new Set([4217, 42431])

type Address = `0x${string}`

type Chain = {
  id: number
  rpcUrls?: {
    default?: {
      http?: readonly string[] | undefined
    }
  }
}

type ChainTarget = {
  chain: Chain
  chainId: number
  name: string
}

type ChainExport = {
  exportedName: string
}

type TokenlistToken = {
  address: string
  chainId: number
  currency?: string | undefined
  decimals: number
  extensions?:
    | {
        currency?: string | undefined
        popular?: boolean | undefined
      }
    | undefined
  logoURI?: string | undefined
  name: string
  popular?: boolean | undefined
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
  currency?: string | undefined
  decimals: number
  importName: string
  name: string
  popular?: boolean | undefined
  sourceOrder: number
  symbol: string
}

const generatedBanner =
  '// Generated with `pnpm gen:tokenlist`. Do not modify manually.'

const definitionsDir = new URL('../src/tokens/definitions/', import.meta.url)
const tokensIndexFile = new URL('../src/tokens/index.ts', import.meta.url)
const chainsIndexFile = new URL('../src/chains/index.ts', import.meta.url)

const tokenlistTokens = await getTokenlistTokens(tokenlistUris)
const tokenChainIds = new Set(tokenlistTokens.map((token) => token.chainId))
const chainTargetById = await getChainTargetById(tokenChainIds)
const unsupportedChainIds = Array.from(tokenChainIds).filter(
  (chainId) => !chainTargetById.has(chainId),
)
if (unsupportedChainIds.length > 0)
  throw new Error(
    `Missing chain target for tokenlist chain id(s): ${unsupportedChainIds.join(', ')}.`,
  )

const tokenDefinitions = await getTokenDefinitions(
  tokenlistTokens,
  getReservedImportNames(),
  chainTargetById,
)

await writeTokenDefinitions(tokenDefinitions)
await writeTokensIndex(tokenDefinitions)

console.log(
  `Synced ${tokenDefinitions.length} token definitions from ${tokenlistUris.length} tokenlist URI(s) across ${tokenChainIds.size} chain(s).`,
)

async function getTokenlistTokens(tokenlistUris: string[]) {
  return (
    await Promise.all(
      tokenlistUris.map(async (uri) =>
        fetchTokenlist(uri).then((tokenlist) => tokenlist.tokens),
      ),
    )
  ).flat()
}

async function getTokenDefinitions(
  tokens: TokenlistToken[],
  reservedImportNames: Set<string>,
  chainTargetById: Map<number, ChainTarget>,
) {
  const tokenGroups = new Map<string, TokenDefinition>()
  let sourceOrder = 0
  for (const token of tokens) {
    const currency = await getTokenCurrency(token, chainTargetById)
    const popular = token.popular ?? token.extensions?.popular
    const key = `${token.symbol}:${token.name}:${token.decimals}`
    const group = tokenGroups.get(key) ?? {
      addresses: new Map<number, string>(),
      currency,
      decimals: token.decimals,
      importName: '',
      name: token.name,
      popular,
      sourceOrder: sourceOrder++,
      symbol: token.symbol,
    }

    const existing = group.addresses.get(token.chainId)
    if (existing && existing.toLowerCase() !== token.address.toLowerCase())
      throw new Error(
        `Duplicate token ${token.symbol} on chain ${token.chainId}: ${existing} and ${token.address}.`,
      )

    group.addresses.set(token.chainId, token.address)
    group.currency ||= currency
    group.popular ||= popular
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

async function getTokenCurrency(
  token: TokenlistToken,
  chainTargetById: Map<number, ChainTarget>,
) {
  const currency = token.currency ?? token.extensions?.currency
  if (currency) return currency
  if (!tempoMetadataChainIds.has(token.chainId)) return undefined

  const target = chainTargetById.get(token.chainId)
  if (!target) return undefined

  try {
    return await getTip20Currency(target, token.address as Address)
  } catch (error) {
    throw new Error(
      `Failed to fetch TIP20 metadata for ${token.address} on chain ${token.chainId}.`,
      { cause: error },
    )
  }
}

async function getTip20Currency(target: ChainTarget, token: Address) {
  const rpcUrl = target.chain.rpcUrls?.default?.http?.[0]
  if (!rpcUrl) throw new Error(`Missing RPC URL for chain ${target.chainId}.`)

  const response = await fetch(rpcUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          data: tip20CurrencyData,
          to: token,
        },
        'latest',
      ],
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok)
    throw new Error(
      `Failed to call ${rpcUrl}: ${response.status} ${response.statusText}`,
    )

  const body = (await response.json()) as unknown
  if (!isRecord(body)) throw new Error(`Invalid RPC response from ${rpcUrl}.`)
  if ('error' in body)
    throw new Error(`RPC error from ${rpcUrl}: ${JSON.stringify(body.error)}.`)
  if (typeof body.result !== 'string')
    throw new Error(`Invalid RPC result from ${rpcUrl}.`)

  return decodeAbiString(body.result)
}

function decodeAbiString(hex: string) {
  if (!/^0x[0-9a-fA-F]*$/.test(hex))
    throw new Error(`Invalid ABI string result: ${hex}.`)

  const data = hex.slice(2)
  const offset = Number.parseInt(data.slice(0, 64), 16)
  if (!Number.isSafeInteger(offset))
    throw new Error(`Invalid ABI string offset: ${hex}.`)

  const lengthStart = offset * 2
  const length = Number.parseInt(data.slice(lengthStart, lengthStart + 64), 16)
  if (!Number.isSafeInteger(length))
    throw new Error(`Invalid ABI string length: ${hex}.`)

  const valueStart = lengthStart + 64
  const value = data.slice(valueStart, valueStart + length * 2)
  if (value.length !== length * 2)
    throw new Error(`Invalid ABI string data: ${hex}.`)

  return new TextDecoder().decode(
    Uint8Array.from(value.match(/.{1,2}/g) ?? [], (byte) =>
      Number.parseInt(byte, 16),
    ),
  )
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
      chain,
      chainId: chain.id,
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

    for (const exportedName of getExportedNames(specifiers))
      chainExports.push({ exportedName })
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
export { defineToken, type Token, type Tokens } from './defineToken.js'
${definitionExports.map((name) => `export { ${name} } from './definitions/${name}.js'`).join('\n')}
`,
  )
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
${token.currency ? `  currency: ${toStringLiteral(token.currency)},\n` : ''}  decimals: ${token.decimals},
  name: ${toStringLiteral(token.name)},
${token.popular ? '  popular: true,\n' : ''}  symbol: ${toStringLiteral(token.symbol)},
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
    if ('currency' in token && typeof token.currency !== 'string')
      throw new Error(
        `Invalid token currency from ${uri} for ${token.address}.`,
      )
    if ('popular' in token && typeof token.popular !== 'boolean')
      throw new Error(
        `Invalid token popular flag from ${uri} for ${token.address}.`,
      )
    if ('extensions' in token && token.extensions !== undefined) {
      if (!isRecord(token.extensions))
        throw new Error(
          `Invalid token extensions from ${uri} for ${token.address}.`,
        )
      if (
        'currency' in token.extensions &&
        typeof token.extensions.currency !== 'string'
      )
        throw new Error(
          `Invalid token extensions.currency from ${uri} for ${token.address}.`,
        )
      if (
        'popular' in token.extensions &&
        typeof token.extensions.popular !== 'boolean'
      )
        throw new Error(
          `Invalid token extensions.popular from ${uri} for ${token.address}.`,
        )
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChain(value: unknown): value is Chain {
  return isRecord(value) && Number.isInteger(value.id)
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}
