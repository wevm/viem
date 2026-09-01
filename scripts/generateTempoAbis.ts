import { execFileSync } from 'node:child_process'
import * as Fs from 'node:fs'
import * as Os from 'node:os'
import * as Path from 'node:path'
import * as Abi from 'ox/Abi'
import * as AbiFunction from 'ox/AbiFunction'
import * as AbiItem from 'ox/AbiItem'

type GeneratedFile = { content: string; path: string }
type AdapterContext = { read: (path: string) => string }
type SourceAdapter = {
  generate: (context: AdapterContext) => Promise<readonly GeneratedFile[]>
  name: 'earn' | 'tempo' | 'zones'
}
type InterfaceDefinition = { items: string[]; name: string }

const adapters: readonly SourceAdapter[] = [
  tempoAdapter(),
  earnAdapter(),
  zonesAdapter(),
]

function tempoAdapter(): SourceAdapter {
  type GitHubContent = {
    download_url: string | null
    name: string
    type: string
  }

  const compatibilityInterfaces: Record<
    string,
    { after: string; items: string[] }
  > = {
    // TODO: Remove after https://github.com/wevm/viem/pull/5029 replaces the legacy multisig implementation.
    INativeMultisig: {
      after: 'IAddressRegistry',
      items: [
        'function deriveAccount(bytes32 salt, uint8 threshold, (address owner, uint8 weight)[] owners) pure returns (address account)',
        'function getConfigCommitment(address account) view returns (bytes32 commitment)',
        'function updateConfig((bytes32 salt, uint64 version, uint8 threshold, (address owner, uint8 weight)[] owners) current, uint8 threshold, (address owner, uint8 weight)[] owners)',
        'event MultisigConfigUpdated(address indexed account, bytes32 salt, uint64 version, uint8 threshold, (address owner, uint8 weight)[] owners)',
        'error InvalidAccount()',
        'error InvalidConfig()',
        'error InvalidThreshold()',
        'error InvalidMultisigOwner()',
        'error InvalidWeight()',
        'error TooManyOwners()',
        'error DuplicateOwner()',
        'error InvalidOwnerOrder()',
        'error UnauthorizedMultisigCaller()',
      ],
    },
  }
  const extensions: Record<string, string[]> = {
    ITIP20: ['IRolesAuth'],
  }
  const outputs = {
    abis: Path.resolve(import.meta.dirname, '../src/tempo/Abis.ts'),
    selectors: Path.resolve(import.meta.dirname, '../src/tempo/Selectors.ts'),
  }
  const repository = 'https://api.github.com/repos/tempoxyz/tempo'

  return {
    name: 'tempo',
    async generate() {
      const commit = await getLatestCommit(repository)
      const { content, files } = await getPrecompileSources(commit)
      const interfaces = parseSolInterfaces(content)
      for (const [name, { after, items }] of Object.entries(
        compatibilityInterfaces,
      )) {
        if (interfaces.has(name)) continue
        if (!interfaces.has(after)) {
          interfaces.set(name, { name, items })
          continue
        }
        const entries = [...interfaces]
        interfaces.clear()
        for (const [interfaceName, definition] of entries) {
          interfaces.set(interfaceName, definition)
          if (interfaceName === after) interfaces.set(name, { name, items })
        }
      }

      const processed: {
        abi: ReturnType<typeof Abi.from>
        exportName: string
      }[] = []
      let output = `// Generated with \`pnpm gen:tempo-abis\`. Do not modify manually.\n// Source: tempoxyz/tempo@${commit}\n\nimport * as Abi from 'ox/Abi'\n\n`
      for (const [interfaceName, definition] of interfaces) {
        const isExtension = Object.values(extensions)
          .flat()
          .includes(interfaceName)
        if (isExtension && !(interfaceName in extensions)) continue
        const items = [...definition.items]
        for (const extensionName of extensions[interfaceName] ?? []) {
          const extension = interfaces.get(extensionName)
          if (extension) items.push(...extension.items)
        }
        if (items.length === 0) continue
        const exportName = tempoExportName(interfaceName)
        const abi = Abi.from(
          items.map((item) =>
            item.replace('external bool', 'external returns (bool)'),
          ),
        )
        output += `export const ${exportName} = ${JSON.stringify(abi)} as const\n\n`
        processed.push({ abi, exportName })
      }
      let selectors =
        "// Generated with `pnpm gen:tempo-abis`. Do not modify manually.\n\nimport type { Abi, ExtractAbiFunctionNames } from 'abitype'\nimport type { Hex } from '../types/misc.js'\nimport type * as Abis from './Abis.js'\n\n"
      selectors +=
        'type FunctionSelectors<\n  abi extends Abi,\n  excluded extends string = never,\n> = {\n  readonly [name in Exclude<ExtractAbiFunctionNames<abi>, excluded>]: Hex\n}\n\n'
      selectors +=
        'type OverloadedFunctionSelectors<names extends string> = {\n  readonly [name in names]: Record<string, Hex>\n}\n\n'
      for (const { abi, exportName } of processed)
        selectors += selectorExport(abi, exportName)
      console.log(
        `  ${processed.length} ABIs from ${files.length} precompile files at ${commit.slice(0, 7)}`,
      )
      return [
        { content: output, path: outputs.abis },
        { content: selectors, path: outputs.selectors },
      ]
    },
  }

  async function getPrecompileSources(ref: string) {
    const entries = await getJson<readonly GitHubContent[]>(
      `${repository}/contents/crates/contracts/src/precompiles?ref=${encodeURIComponent(ref)}`,
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

  function tempoExportName(interfaceName: string) {
    let name = interfaceName.startsWith('I')
      ? interfaceName.slice(1)
      : interfaceName
    if (/^TIP[A-Z]/.test(name)) name = name.slice(3)
    return camelCase(name)
  }
}

function earnAdapter(): SourceAdapter {
  type AbiParameter = {
    components?: readonly AbiParameter[] | undefined
    internalType?: string | undefined
    name?: string | undefined
    type: string
  }
  type AbiEntry = {
    inputs?: readonly AbiParameter[] | undefined
    name?: string | undefined
    outputs?: readonly AbiParameter[] | undefined
    type: string
  }
  type FoundryArtifact = {
    abi: AbiEntry[]
    bytecode: string
    kind: 'contract' | 'interface' | 'library'
    name: string
    source: string
  }
  type FoundryArtifactJson = {
    abi: AbiEntry[]
    bytecode?: { object?: string | undefined } | undefined
    metadata?:
      | { settings: { compilationTarget: Record<string, string> } }
      | undefined
  }

  const outputs = {
    abis: Path.resolve(import.meta.dirname, '../src/tempo/Abis.ts'),
    contracts: Path.resolve(
      import.meta.dirname,
      '../test/src/tempo/earnContracts.ts',
    ),
  }
  const repository = 'https://github.com/tempoxyz/earn.git'
  const marker = '// Source: tempoxyz/earn@'

  return {
    name: 'earn',
    async generate(context) {
      const commit = getLatestGitCommit(repository)
      const checkout = prepareCheckout(commit)
      const artifacts = getArtifacts(checkout)
      const abiGroups = new Map<string, FoundryArtifact[]>()
      for (const artifact of artifacts) {
        if (
          artifact.kind !== 'contract' &&
          !artifact.source.startsWith('src/interfaces/engines/IEarnEngine')
        )
          continue
        if (artifact.source.startsWith('src/demo/')) continue
        // Auxiliary deployments are not part of Viem's Earn action ABI surface.
        if (/(Registry|Solver)$/.test(artifact.name)) continue
        const exportName = abiExportName(artifact.name)
        const group = abiGroups.get(exportName) ?? []
        group.push(artifact)
        abiGroups.set(exportName, group)
      }

      const abiExports = [...abiGroups]
        .sort(([a], [b]) => compareStrings(a, b))
        .map(([exportName, group]) => {
          const seen = new Set<string>()
          const abi = group
            .sort((a, b) => compareStrings(a.name, b.name))
            .flatMap(({ abi }) => abi)
            .map(normalizeAbiItem)
            .filter((item) => {
              const signature = item.name
                ? AbiItem.getSignature(item as AbiItem.AbiItem)
                : item.type
              if (seen.has(signature)) return false
              seen.add(signature)
              return true
            })
          return `export const ${exportName} = ${JSON.stringify(abi)} as const`
        })
      const abiSlice = `${marker}${commit}\n\n${abiExports.join('\n\n')}\n\n// \`SingleZoneEarnRouter.CallbackData\` parameter for \`encodeAbiParameters\`.\nexport const earnRouterCallbackData = ${JSON.stringify(routerCallbackDataParameter(checkout))} as const\n`
      const currentAbis = context.read(outputs.abis)
      const markerIndex = currentAbis.indexOf(marker)
      const base = (
        markerIndex === -1 ? currentAbis : currentAbis.slice(0, markerIndex)
      ).trimEnd()

      const deployables = artifacts
        .filter(
          (artifact) =>
            artifact.kind === 'contract' && artifact.bytecode.length > 2,
        )
        .sort((a, b) => compareStrings(a.name, b.name))
      const contracts = deployables.map(
        ({ abi, bytecode, name }) =>
          `export const ${abiExportName(name)} = {\n  abi: ${JSON.stringify(abi.map(normalizeAbiItem))},\n  bytecode: '${bytecode}',\n} as const`,
      )
      const contractsOutput = `// Generated with \`pnpm gen:tempo-abis\`. Do not modify manually.\n${marker}${commit}\n\n${contracts.join('\n\n')}\n`

      console.log(
        `  ${abiGroups.size} ABI exports and ${deployables.length} deploy artifacts at ${commit.slice(0, 7)}`,
      )
      return [
        { content: `${base}\n\n${abiSlice}`, path: outputs.abis },
        { content: contractsOutput, path: outputs.contracts },
      ]
    },
  }

  function prepareCheckout(commit: string) {
    const configured = process.env.EARN_CONTRACTS_PATH
    if (configured) {
      validateCheckout(configured, commit)
      return configured
    }
    const cache = Path.join(Os.tmpdir(), 'viem-tempo-abis', 'earn')
    const path = Path.join(cache, commit)
    if (Fs.existsSync(path)) {
      validateCheckout(path, commit)
      return path
    }
    Fs.mkdirSync(cache, { recursive: true })
    const temporaryPath = Fs.mkdtempSync(Path.join(cache, `${commit}.`))
    try {
      execFileSync('git', ['init', '--quiet'], { cwd: temporaryPath })
      execFileSync('git', ['remote', 'add', 'origin', repository], {
        cwd: temporaryPath,
      })
      execFileSync('git', ['fetch', '--depth', '1', 'origin', commit], {
        cwd: temporaryPath,
        stdio: 'inherit',
      })
      execFileSync('git', ['checkout', '--detach', '--quiet', 'FETCH_HEAD'], {
        cwd: temporaryPath,
      })
      execFileSync(
        'git',
        [
          'submodule',
          'update',
          '--init',
          '--recursive',
          '--depth',
          '1',
          '--quiet',
        ],
        { cwd: temporaryPath },
      )
      validateCheckout(temporaryPath, commit)
      Fs.renameSync(temporaryPath, path)
      return path
    } catch (error) {
      Fs.rmSync(temporaryPath, { force: true, recursive: true })
      throw error
    }
  }

  function validateCheckout(checkout: string, commit: string) {
    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: checkout,
      encoding: 'utf8',
    }).trim()
    if (status) throw new Error('The Earn checkout must be clean.')
    const head = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: checkout,
      encoding: 'utf8',
    }).trim()
    if (head !== commit)
      throw new Error(
        `The Earn checkout must be at ${commit}, received ${head}.`,
      )
    const uninitialized = execFileSync(
      'git',
      ['submodule', 'status', '--recursive'],
      { cwd: checkout, encoding: 'utf8' },
    )
      .split('\n')
      .some((line) => line.startsWith('-'))
    if (uninitialized)
      throw new Error('The Earn checkout has uninitialized submodules.')
  }

  function getArtifacts(checkout: string) {
    execFileSync('forge', ['build', '--quiet'], { cwd: checkout })
    const artifacts = new Map<string, FoundryArtifact>()
    for (const file of listFiles(Path.join(checkout, 'out'))) {
      if (!file.endsWith('.json') || file.includes('/build-info/')) continue
      const artifact = JSON.parse(
        Fs.readFileSync(file, 'utf8'),
      ) as FoundryArtifactJson
      const [target] = Object.entries(
        artifact.metadata?.settings.compilationTarget ?? {},
      )
      if (!target) continue
      const [source, name] = target
      if (!source.startsWith('src/')) continue
      const sourceContent = Fs.readFileSync(Path.join(checkout, source), 'utf8')
      const match = sourceContent.match(
        new RegExp(
          `\\b(abstract\\s+contract|contract|interface|library)\\s+${escapeRegex(name)}\\b`,
        ),
      )
      if (!match || match[1] === 'abstract contract') continue
      const kind = match[1]
      if (kind !== 'contract' && kind !== 'interface' && kind !== 'library')
        continue
      artifacts.set(`${source}:${name}`, {
        abi: artifact.abi,
        bytecode: artifact.bytecode?.object ?? '0x',
        kind,
        name,
        source,
      })
    }
    return [...artifacts.values()]
  }

  function abiExportName(name: string) {
    if (name === 'SingleZoneEarnRouter') return 'earnRouter'
    if (
      name.startsWith('IEarnEngine') &&
      name !== 'IEarnEngineAsyncRedeem' &&
      name !== 'IEarnEngineInKindDeposit'
    )
      return 'earnEngine'
    return camelCase(name.startsWith('I') ? name.slice(1) : name)
  }

  function extractStruct(file: string, name: string) {
    const content = Fs.readFileSync(file, 'utf8')
    const body = content.match(new RegExp(`struct ${name} \\{([^}]*)\\}`))?.[1]
    if (!body) throw new Error(`struct ${name} not found in ${file}`)
    return body
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n')
      .split(';')
      .map((field) => field.trim())
      .filter(Boolean)
      .map((field) => {
        const [type, fieldName] = field.split(/\s+/)
        if (!type || !fieldName) throw new Error(`Unparsable field in ${file}.`)
        return { name: fieldName, type }
      })
  }

  function structComponents(
    file: string,
    name: string,
    nested: Record<string, readonly AbiParameter[]> = {},
  ) {
    return extractStruct(file, name).map(({ name, type }) => {
      if (type === 'Flow') return { name, type: 'uint8' }
      const components = nested[type]
      if (components) return { components, name, type: 'tuple' }
      return { name, type }
    })
  }

  function routerCallbackDataParameter(checkout: string) {
    const zone = Path.join(checkout, 'src/interfaces/external/tempo/IZone.sol')
    const router = Path.join(checkout, 'src/router/SingleZoneEarnRouter.sol')
    const encrypted = structComponents(zone, 'EncryptedDepositPayload')
    const zoneReturn = structComponents(router, 'ZoneReturn', {
      EncryptedDepositPayload: encrypted,
    })
    const components = structComponents(router, 'CallbackData', {
      ZoneReturn: zoneReturn,
    })
    return [{ components, name: 'callbackData', type: 'tuple' }] as const
  }

  function normalizeAbiParameter(parameter: AbiParameter): AbiParameter {
    const { internalType: _, components, ...value } = parameter
    return {
      ...value,
      ...(components
        ? { components: components.map(normalizeAbiParameter) }
        : {}),
    }
  }

  function normalizeAbiItem(item: AbiEntry): AbiEntry {
    return {
      ...item,
      ...(item.inputs
        ? { inputs: item.inputs.map(normalizeAbiParameter) }
        : {}),
      ...(item.outputs
        ? { outputs: item.outputs.map(normalizeAbiParameter) }
        : {}),
    }
  }
}

function zonesAdapter(): SourceAdapter {
  const compatibility: Record<string, readonly AbiItem.AbiItem[]> = {
    IZoneOutbox: Abi.from([]),
    ZoneFactory: Abi.from([
      'event ZoneCreated(uint32 indexed zoneId, address indexed portal, address indexed messenger, address initialToken, address admin, address sequencer, address verifier, bytes32 genesisBlockHash, bytes32 genesisTempoBlockHash, uint64 genesisTempoBlockNumber)',
      'function createZone((address initialToken, address admin, address sequencer, address verifier, (bytes32 genesisBlockHash, bytes32 genesisTempoBlockHash, uint64 genesisTempoBlockNumber) zoneParams, string rpcUrl) params) returns (uint32 zoneId, address portal)',
      'function verifier() view returns (address)',
    ]),
    ZonePortal: Abi.from([
      'function deposit(address _token, address to, uint128 amount, bytes32 memo, address tempoRefundRecipient) returns (bytes32)',
      'function sequencerEncryptionKey() view returns (bytes32 x, uint8 yParity, address pubkey)',
    ]),
  }
  const outputs = {
    abis: Path.resolve(import.meta.dirname, '../src/tempo/Abis.ts'),
    selectors: Path.resolve(import.meta.dirname, '../src/tempo/Selectors.ts'),
  }
  const repository = 'https://raw.githubusercontent.com/tempoxyz/zones'
  const repositoryApi = 'https://api.github.com/repos/tempoxyz/zones'
  const sources = [
    'crates/contracts/src/precompiles/zone_factory.rs',
    'crates/contracts/src/precompiles/zone_portal.rs',
    'crates/contracts/src/precompiles/outbox.rs',
  ] as const
  const interfaceSource = 'crates/contracts/src/runtime/interfaces/IZone.sol'
  const runtimeInterfaces = [
    { exportName: 'zoneMessenger', name: 'IZoneMessenger' },
    { exportName: 'zoneVerifier', name: 'IVerifier' },
  ] as const
  return {
    name: 'zones',
    async generate(context) {
      const commit = await getLatestCommit(repositoryApi)
      const [sourceFiles, interfaceContent] = await Promise.all([
        Promise.all(
          sources.map(async (file) => ({
            content: await getText(`${repository}/${commit}/${file}`),
            file,
          })),
        ),
        getText(`${repository}/${commit}/${interfaceSource}`),
      ])
      const definitions = parseSolInterfaces(
        sourceFiles.map(({ content }) => content).join('\n\n'),
      )
      const solidityDefinitions = parseSolidityInterfaces(interfaceContent)
      for (const { exportName, name } of runtimeInterfaces) {
        const definition = solidityDefinitions.get(name)
        if (!definition)
          throw new Error(`Zone runtime interface ${name} not found.`)
        definitions.set(exportName, { ...definition, name: exportName })
      }
      const generated = [...definitions.values()].map((definition) => {
        const items = new Map<string, AbiItem.AbiItem>()
        for (const item of Abi.from(definition.items))
          items.set(AbiItem.getSignature(item), item)
        for (const item of compatibility[definition.name] ?? [])
          items.set(AbiItem.getSignature(item), item)
        const exportName = camelCase(
          definition.name.startsWith('I')
            ? definition.name.slice(1)
            : definition.name,
        )
        return { abi: [...items.values()], exportName }
      })

      let abis = context.read(outputs.abis)
      const appended: string[] = []
      let selectors = context.read(outputs.selectors)
      for (const generatedAbi of generated) {
        const current = readAbiExport(abis, generatedAbi.exportName)
        let abi = generatedAbi.abi
        if (!current) {
          appended.push(
            `export const ${generatedAbi.exportName} = ${JSON.stringify(abi)} as const`,
          )
        } else {
          const items = new Map<string, AbiItem.AbiItem>()
          for (const item of current)
            items.set(AbiItem.getSignature(item), item)
          for (const item of generatedAbi.abi) {
            const signature = AbiItem.getSignature(item)
            if (!items.has(signature)) items.set(signature, item)
          }
          abi = [...items.values()]
          abis = replaceAbiExport(abis, generatedAbi.exportName, abi)
        }
        selectors = replaceSelectorExport(
          selectors,
          generatedAbi.exportName,
          selectorExport(abi, generatedAbi.exportName),
        )
      }
      const sourceHeader = `// Source: tempoxyz/zones@${commit}`
      abis = `${abis.trimEnd()}\n\n${sourceHeader}\n\n${appended.join('\n\n')}\n`
      const earnSourceIndex = abis.indexOf('// Source: tempoxyz/earn@')
      const zoneSourceIndex = abis.indexOf(sourceHeader)
      if (earnSourceIndex === -1 || zoneSourceIndex === -1)
        throw new Error('Could not find generated ABI source sections.')
      const groups = [
        [
          'core',
          getAbiExportNames(abis.slice(0, earnSourceIndex)).sort(
            compareStrings,
          ),
        ],
        [
          'earn',
          getAbiExportNames(abis.slice(earnSourceIndex, zoneSourceIndex)).sort(
            compareStrings,
          ),
        ],
        [
          'zone',
          getAbiExportNames(abis.slice(zoneSourceIndex)).sort(compareStrings),
        ],
      ] as const
      abis += `\n${groups
        .map(
          ([group, names]) =>
            `export const ${group} = [\n${names.map((name) => `  ...${name},`).join('\n')}\n] as const`,
        )
        .join(
          '\n\n',
        )}\n\nexport const all = [\n${groups.map(([group]) => `  ...${group},`).join('\n')}\n] as const\n`
      console.log(
        `  ${definitions.size} ABIs from ${sourceFiles.length + 1} contract files at ${commit.slice(0, 7)}`,
      )
      return [
        { content: abis, path: outputs.abis },
        { content: selectors, path: outputs.selectors },
      ]
    },
  }
}

function parseSolInterfaces(content: string) {
  const interfaces = new Map<string, InterfaceDefinition>()
  for (const solMatch of content.matchAll(/sol!\s*\{([\s\S]*?)\n\}/gs)) {
    const [, solBlock] = solMatch
    if (!solBlock) continue
    const sharedStructs: string[] = []
    for (const structMatch of solBlock.matchAll(
      /^ {4}struct\s+(\w+)\s*\{([^}]+)\}/gm,
    )) {
      const [, name, body] = structMatch
      if (!name || !body) continue
      const fields = parseSolStructFields(body)
      if (fields.length > 0)
        sharedStructs.push(`struct ${name} { ${fields.join('; ')}; }`)
    }
    for (const interfaceMatch of solBlock.matchAll(
      /(?:interface|contract)\s+(\w+)\s*\{([\s\S]*?)\n {4}\}/g,
    )) {
      const [, name, body] = interfaceMatch
      if (!name || !body) continue
      const items = [...sharedStructs]
      const enumDefinitions = new Set<string>()
      const enumTypes = new Set<string>()
      for (const enumMatch of body.matchAll(/enum\s+(\w+)\s*\{([^}]+)\}/g)) {
        const [fullMatch, enumName] = enumMatch
        if (!enumName) continue
        enumTypes.add(enumName)
        enumDefinitions.add(fullMatch)
      }
      const replaceEnumTypes = (definition: string) => {
        let result = definition
        for (const enumType of enumTypes)
          result = result.replace(new RegExp(`\\b${enumType}\\b`, 'g'), 'uint8')
        return result
      }
      let cleanBody = body
      for (const enumDefinition of enumDefinitions)
        cleanBody = cleanBody.replace(enumDefinition, '')
      const structDefinitions = new Set<string>()
      for (const structMatch of cleanBody.matchAll(
        /struct\s+(\w+)\s*\{([^}]+)\}/g,
      )) {
        const [fullMatch, structName, structBody] = structMatch
        if (!structName || !structBody) continue
        const fields = parseSolStructFields(structBody)
        if (fields.length === 0) continue
        items.push(
          replaceEnumTypes(`struct ${structName} { ${fields.join('; ')}; }`),
        )
        structDefinitions.add(fullMatch)
      }
      for (const structDefinition of structDefinitions)
        cleanBody = cleanBody.replace(structDefinition, '')
      const normalizedBody = cleanBody
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('//'))
        .join(' ')
      for (const pattern of [
        /function\s+[^;]+;/g,
        /event\s+[^;]+;/g,
        /error\s+\w+\([^)]*\)/g,
      ]) {
        for (const match of normalizedBody.matchAll(pattern)) {
          const [definition] = match
          items.push(
            replaceEnumTypes(
              definition
                .replace(/\s+/g, ' ')
                .replace(/\s*;\s*$/, '')
                .trim(),
            ),
          )
        }
      }
      if (items.length > 0) interfaces.set(name, { items, name })
    }
  }
  return interfaces
}

function parseSolidityInterfaces(content: string) {
  const enumTypes = new Set(
    [...content.matchAll(/^enum\s+(\w+)\s*\{[^}]+\}/gm)]
      .map((match) => match[1])
      .filter((name): name is string => Boolean(name)),
  )
  const replaceEnumTypes = (definition: string) => {
    let result = definition
    for (const enumType of enumTypes)
      result = result.replace(new RegExp(`\\b${enumType}\\b`, 'g'), 'uint8')
    return result
  }
  const sharedStructs: string[] = []
  for (const structMatch of content.matchAll(
    /^struct\s+(\w+)\s*\{([^}]+)\}/gm,
  )) {
    const [, name, body] = structMatch
    if (!name || !body) continue
    const fields = parseSolStructFields(body)
    if (fields.length > 0)
      sharedStructs.push(
        replaceEnumTypes(`struct ${name} { ${fields.join('; ')}; }`),
      )
  }

  const interfaces = new Map<string, InterfaceDefinition>()
  for (const interfaceMatch of content.matchAll(
    /^interface\s+(\w+)(?:\s+is\s+[^{]+)?\s*\{([\s\S]*?)^\}/gm,
  )) {
    const [, name, body] = interfaceMatch
    if (!name || !body) continue
    const items = [...sharedStructs]
    const normalizedBody = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
      .join(' ')
    for (const pattern of [
      /function\s+[^;]+;/g,
      /event\s+[^;]+;/g,
      /error\s+\w+\([^)]*\)/g,
    ]) {
      for (const match of normalizedBody.matchAll(pattern)) {
        const [definition] = match
        items.push(
          replaceEnumTypes(
            definition
              .replace(/\s+/g, ' ')
              .replace(/\s*;\s*$/, '')
              .trim(),
          ),
        )
      }
    }
    if (items.length > sharedStructs.length)
      interfaces.set(name, { items, name })
  }
  return interfaces
}

function parseSolStructFields(body: string) {
  return body
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
    .split(';')
    .map((field) => field.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function camelCase(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\-. \s]+/)
    .map((word, index) =>
      index ? word[0]!.toUpperCase() + word.slice(1) : word,
    )
    .join('')
}

function readAbiExport(content: string, name: string) {
  const prefix = `export const ${name} = `
  const start = content.indexOf(prefix)
  if (start === -1) return undefined
  const valueStart = start + prefix.length
  const valueEnd = content.indexOf(' as const', valueStart)
  if (valueEnd === -1)
    throw new Error(`Could not parse generated ABI export ${name}.`)
  return JSON.parse(content.slice(valueStart, valueEnd)) as AbiItem.AbiItem[]
}

function getAbiExportNames(content: string) {
  return [...content.matchAll(/^export const (\w+) = \[/gm)]
    .map((match) => match[1]!)
    .filter(
      (name) =>
        name !== 'all' &&
        name !== 'core' &&
        name !== 'earn' &&
        name !== 'earnRouterCallbackData' &&
        name !== 'zone',
    )
}

function replaceAbiExport(
  content: string,
  name: string,
  abi: readonly AbiItem.AbiItem[],
) {
  const prefix = `export const ${name} = `
  const start = content.indexOf(prefix)
  if (start === -1) return content
  const valueStart = start + prefix.length
  const valueEnd = content.indexOf(' as const', valueStart)
  if (valueEnd === -1)
    throw new Error(`Could not parse generated ABI export ${name}.`)
  return `${content.slice(0, valueStart)}${JSON.stringify(abi)}${content.slice(valueEnd)}`
}

function replaceSelectorExport(
  content: string,
  name: string,
  replacement: string,
) {
  const start = content.indexOf(`export const ${name} = `)
  if (!replacement) return content
  if (start === -1) return `${content.trimEnd()}\n\n${replacement}`
  const end = content.indexOf('\n\n', start)
  if (end === -1) return `${content.slice(0, start)}${replacement.trimEnd()}\n`
  return `${content.slice(0, start)}${replacement}${content.slice(end + 2)}`
}

function selectorExport(abi: readonly AbiItem.AbiItem[], exportName: string) {
  const functions = abi
    .filter((item) => item.type === 'function')
    .sort(
      (a, b) =>
        compareStrings(a.name, b.name) ||
        compareStrings(AbiItem.getSignature(a), AbiItem.getSignature(b)),
    )
  if (functions.length === 0) return ''
  const names = functions.map((item) => item.name)
  const overloadedNames = Array.from(
    new Set(names.filter((name, index) => names.indexOf(name) !== index)),
  ).sort(compareStrings)
  const values: Record<string, string | Record<string, string>> = {}
  for (const item of functions) {
    const selector = AbiFunction.getSelector(item)
    if (!overloadedNames.includes(item.name)) {
      values[item.name] = selector
      continue
    }
    values[item.name] ??= {}
    ;(values[item.name] as Record<string, string>)[AbiItem.getSignature(item)] =
      selector
  }
  const overloadedNameType = overloadedNames
    .map((name) => `'${name}'`)
    .join(' | ')
  const selectorType =
    overloadedNames.length > 0
      ? `FunctionSelectors<typeof Abis.${exportName}, ${overloadedNameType}> & OverloadedFunctionSelectors<${overloadedNameType}>`
      : `FunctionSelectors<typeof Abis.${exportName}>`
  return `export const ${exportName} = ${JSON.stringify(values, null, 2)} as const satisfies ${selectorType}\n\n`
}

function compareStrings(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function listFiles(root: string): string[] {
  return Fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = Path.join(root, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
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

async function getLatestCommit(repository: string) {
  const { sha } = await getJson<{ sha: string }>(`${repository}/commits/HEAD`)
  if (!/^[0-9a-f]{40}$/.test(sha))
    throw new Error(`Invalid latest commit for ${repository}: ${sha}.`)
  return sha
}

function getLatestGitCommit(repository: string) {
  const [sha] = execFileSync('git', ['ls-remote', repository, 'HEAD'], {
    encoding: 'utf8',
  }).split(/\s+/)
  if (!sha || !/^[0-9a-f]{40}$/.test(sha))
    throw new Error(`Invalid latest commit for ${repository}: ${sha}.`)
  return sha
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

const generated = new Map<string, string>()
const context: AdapterContext = {
  read(path) {
    return generated.get(path) ?? Fs.readFileSync(path, 'utf8')
  },
}
for (const adapter of adapters) {
  const files = await adapter.generate(context)
  for (const file of files) generated.set(file.path, file.content)
  console.log(`✓ Generated ${adapter.name} artifacts`)
}
for (const [path, content] of generated) writeAtomic(path, content)
