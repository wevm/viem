import * as Fs from 'node:fs'
import * as Path from 'node:path'
import * as Abi from 'ox/Abi'

const extensions: Record<string, readonly string[]> = {
  ITIP20: ['IRolesAuth'],
}

// Fallbacks for interfaces absent from older Tempo releases.
const extraAbis: Record<string, readonly unknown[]> = {
  storageCredits: [
    { type: 'error', name: 'DelegateCallNotAllowed', inputs: [] },
    { type: 'error', name: 'InvalidMode', inputs: [] },
    {
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint64' }],
    },
    {
      type: 'function',
      name: 'modeOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint8' }],
    },
    {
      type: 'function',
      name: 'budgetOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint64' }],
    },
    {
      type: 'function',
      name: 'setMode',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'newMode', type: 'uint8' }],
      outputs: [],
    },
    {
      type: 'function',
      name: 'setBudget',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'creditBudget', type: 'uint64' }],
      outputs: [],
    },
  ],
}

type Source = {
  commit: string
  ref: string
}

type GitHubContent = {
  download_url: string | null
  name: string
  type: string
}

type GitHubRef = {
  object: GitHubObject
  ref: string
}

type GitHubObject = {
  sha: string
  type: string
  url: string
}

type GitHubTag = {
  object: GitHubObject
}

const githubApi = 'https://api.github.com/repos/tempoxyz/tempo'
const tagPrefix = 'tempo-contracts@'
const out = Path.resolve(import.meta.dirname, '../src/tempo/Abis.ts')
const sync = process.argv.includes('--sync')
const source = sync ? await getLatestSource() : getTrackedSource()
if (!new RegExp(`^${tagPrefix}\\d+\\.\\d+\\.\\d+$`).test(source.ref))
  throw new Error(`Invalid Tempo contracts ref: ${source.ref}.`)
if (!/^[0-9a-f]{40}$/.test(source.commit))
  throw new Error(`Invalid Tempo commit: ${source.commit}.`)

const { content, files } = await getPrecompileSources(source.commit)

type InterfaceDefinition = {
  name: string
  items: string[]
}

const interfaces = new Map<string, InterfaceDefinition>()

// Extract all sol! blocks
const solBlockRegex = /sol!\s*\{([\s\S]*?)\n\}/gs

for (const solMatch of content.matchAll(solBlockRegex)) {
  const [, solBlock] = solMatch
  if (!solBlock) continue

  // Extract all interfaces from this sol! block
  // Match interface name and opening brace, then capture everything until
  // we find a closing brace with 4 spaces of indentation (interface-level closing brace)
  const interfaceRegex = /interface\s+(\w+)\s*\{([\s\S]*?)\n {4}\}/g

  for (const interfaceMatch of solBlock.matchAll(interfaceRegex)) {
    const [, name, body] = interfaceMatch
    if (!name || !body) continue

    const items: string[] = []

    // Extract enums and track them to replace with uint8 in function signatures
    const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g
    const enumDefinitions = new Set<string>()
    const enumTypes = new Set<string>()
    for (const enumMatch of body.matchAll(enumRegex)) {
      const [fullMatch, enumName] = enumMatch
      if (!enumName) continue
      enumTypes.add(enumName)
      enumDefinitions.add(fullMatch)
    }

    // Remove enum definitions from body for cleaner processing
    let cleanBody = body
    for (const enumDef of enumDefinitions) {
      cleanBody = cleanBody.replace(enumDef, '')
    }

    // Helper function to replace enum types with uint8
    const replaceEnumTypes = (definition: string): string => {
      let result = definition
      for (const enumType of enumTypes) {
        // Replace enum type with uint8 in function parameters and return types
        result = result.replace(new RegExp(`\\b${enumType}\\b`, 'g'), 'uint8')
      }
      return result
    }

    // Extract structs
    const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g
    const structDefinitions = new Set<string>()
    for (const structMatch of cleanBody.matchAll(structRegex)) {
      const [fullMatch, structName, structBody] = structMatch
      if (!structName || !structBody) continue

      // Parse struct fields. Strip comment lines before splitting on `;` so
      // that semicolons inside doc comments aren't treated as field separators.
      const fields = structBody
        .split('\n')
        .filter((line) => !line.trim().startsWith('///'))
        .join('\n')
        .split(';')
        .map((f) => f.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

      if (fields.length > 0) {
        let structDef = `struct ${structName} { ${fields.join('; ')}; }`
        // Replace enum types with uint8
        structDef = replaceEnumTypes(structDef)
        items.push(structDef)
        structDefinitions.add(fullMatch)
      }
    }

    // Remove struct definitions from body for cleaner processing
    for (const structDef of structDefinitions) {
      cleanBody = cleanBody.replace(structDef, '')
    }

    // Now extract functions, events, and errors line by line
    // First, normalize the body to handle multi-line declarations
    const normalizedBody = cleanBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
      .join(' ')

    // Extract all functions (including multi-line ones)
    const functionRegex = /function\s+[^;]+;/g
    for (const functionMatch of normalizedBody.matchAll(functionRegex)) {
      let [functionDef] = functionMatch
      // Clean up the function definition
      functionDef = functionDef
        .replace(/\s+/g, ' ') // normalize whitespace
        .replace(/\s*;\s*$/, '') // remove trailing semicolon
        .trim()
      // Replace enum types with uint8
      functionDef = replaceEnumTypes(functionDef)
      items.push(functionDef)
    }

    // Extract all events
    const eventRegex = /event\s+[^;]+;/g
    for (const eventMatch of normalizedBody.matchAll(eventRegex)) {
      let [eventDef] = eventMatch
      // Clean up the event definition
      eventDef = eventDef
        .replace(/\s+/g, ' ') // normalize whitespace
        .replace(/\s*;\s*$/, '') // remove trailing semicolon
        .trim()
      // Replace enum types with uint8
      eventDef = replaceEnumTypes(eventDef)
      items.push(eventDef)
    }

    // Extract all errors
    const errorRegex = /error\s+\w+\([^)]*\)/g
    for (const errorMatch of normalizedBody.matchAll(errorRegex)) {
      let [errorDef] = errorMatch
      // Clean up the error definition
      errorDef = errorDef.replace(/\s+/g, ' ').trim()
      // Replace enum types with uint8
      errorDef = replaceEnumTypes(errorDef)
      items.push(errorDef)
    }

    if (items.length > 0) {
      interfaces.set(name, { name, items })
    }
  }
}

let output = `// Generated with \`pnpm gen:tempo-abis\`. Do not modify manually.\n// Source: \`${source.ref}\` at \`${source.commit}\`.\n\n`

// Generate ABIs for all interfaces
const exportNames: string[] = []

for (const [interfaceName, interfaceData] of interfaces.entries()) {
  // Skip if this interface is only used as an extension (not exported standalone)
  const isUsedAsExtension = Object.values(extensions)
    .flat()
    .includes(interfaceName)
  const isExtendedItself = interfaceName in extensions

  if (isUsedAsExtension && !isExtendedItself) {
    // Skip interfaces that are only used to extend others
    continue
  }

  const allItems: string[] = []

  // Add items from the main interface
  allItems.push(...interfaceData.items)

  // Add items from extension interfaces if defined
  const extensionInterfaces = extensions[interfaceName] || []
  for (const extensionName of extensionInterfaces) {
    const extensionInterface = interfaces.get(extensionName)
    if (extensionInterface) {
      allItems.push(...extensionInterface.items)
    }
  }

  if (allItems.length === 0) continue

  // Generate export name: remove 'I' prefix, convert to camelCase, add 'Abi' suffix
  let cleanName = interfaceName.startsWith('I')
    ? interfaceName.slice(1)
    : interfaceName

  // Handle TIP prefix specially (remove it from the export name)
  if (cleanName.startsWith('TIP') && cleanName.length > 3) {
    const charAfterTip = cleanName.charAt(3)
    if (charAfterTip >= 'A' && charAfterTip <= 'Z') {
      cleanName = cleanName.slice(3)
    }
  }

  const exportName = cleanName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\-. \s]+/)
    .map((w, i) => (i ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join('')

  // Format items as array of strings
  const items = allItems.map((item) => {
    return item.replace('external bool', 'external returns (bool)')
  })

  output += `export const ${exportName} = ${JSON.stringify(Abi.from(items))} as const\n\n`
  exportNames.push(exportName)
}

// Emit interfaces missing from this release.
for (const [exportName, abi] of Object.entries(extraAbis)) {
  if (exportNames.includes(exportName)) continue
  output += `export const ${exportName} = ${JSON.stringify(abi)} as const\n\n`
  exportNames.push(exportName)
}

// Generate concatenated `abis` export
// Pure IIFE keeps the aggregate tree-shakable for consumers not using it.
output += `export const abis = /*#__PURE__*/ (() =>\n  [\n${exportNames.map((n) => `    ...${n},`).join('\n')}\n  ] as const)()\n`

writeAtomic(out, output)

console.log(
  `✓ Generated ${exportNames.length} ABIs from ${files.length} precompile files at ${source.ref} (${source.commit.slice(0, 7)})`,
)

async function getLatestSource(): Promise<Source> {
  const refs: GitHubRef[] = []
  for (let page = 1; ; page++) {
    const result = await getJson<readonly GitHubRef[]>(
      `${githubApi}/git/matching-refs/tags/${encodeURIComponent(tagPrefix)}?per_page=100&page=${page}`,
    )
    refs.push(...result)
    if (result.length < 100) break
  }

  const versions = refs
    .flatMap(({ object, ref }) => {
      const match = ref.match(/^refs\/tags\/tempo-contracts@(\d+\.\d+\.\d+)$/)
      return match?.[1] ? [{ object, version: match[1] }] : []
    })
    .sort((a, b) => compareVersions(a.version, b.version))
  const release = versions.at(-1)
  if (!release) throw new Error('No Tempo contracts releases found.')
  return {
    ref: `${tagPrefix}${release.version}`,
    commit: await getCommit(release.object),
  }
}

function getTrackedSource(): Source {
  const match = Fs.readFileSync(out, 'utf8').match(
    /^\/\/ Source: `(tempo-contracts@\d+\.\d+\.\d+)` at `([0-9a-f]{40})`\.$/m,
  )
  const [, ref, commit] = match ?? []
  if (!ref || !commit)
    throw new Error(
      'Missing Tempo source pin. Run `pnpm sync:tempo-abis` to restore it.',
    )
  return { commit, ref }
}

async function getCommit(object: GitHubObject): Promise<string> {
  if (object.type === 'commit') return object.sha
  if (object.type !== 'tag')
    throw new Error(`Unsupported Tempo ref object: ${object.type}.`)
  const tag = await getJson<GitHubTag>(object.url)
  return getCommit(tag.object)
}

async function getPrecompileSources(ref: string) {
  const entries = await getJson<readonly GitHubContent[]>(
    `${githubApi}/contents/crates/contracts/src/precompiles?ref=${encodeURIComponent(ref)}`,
  )
  const files = entries
    .filter(
      (entry) =>
        entry.type === 'file' &&
        entry.name.endsWith('.rs') &&
        entry.name !== 'mod.rs',
    )
    .sort((a, b) => a.name.localeCompare(b.name))
  if (files.length === 0)
    throw new Error(`No Tempo precompile sources found at ${ref}.`)

  const content = await Promise.all(
    files.map(({ download_url, name }) => {
      if (!download_url)
        throw new Error(`Missing download URL for Tempo source ${name}.`)
      return getText(download_url)
    }),
  )
  return {
    content: content.join('\n\n'),
    files: files.map(({ name }) => name),
  }
}

function compareVersions(a: string, b: string) {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)
  for (let index = 0; index < 3; index++) {
    const difference = left[index]! - right[index]!
    if (difference !== 0) return difference
  }
  return 0
}

async function getJson<result>(url: string) {
  const githubToken = process.env.GITHUB_TOKEN
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'viem',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  })
  if (!response.ok)
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}.`,
    )
  return response.json() as Promise<result>
}

async function getText(url: string) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}.`,
    )
  return response.text()
}

function writeAtomic(path: string, content: string) {
  const temporaryPath = `${path}.${process.pid}.tmp`
  try {
    Fs.writeFileSync(temporaryPath, content)
    Fs.renameSync(temporaryPath, path)
  } finally {
    if (Fs.existsSync(temporaryPath)) Fs.unlinkSync(temporaryPath)
  }
}
