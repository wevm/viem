import { execFileSync } from 'node:child_process'
import * as Fs from 'node:fs'
import * as Path from 'node:path'
import { AbiItem } from 'ox'

// Run with `EARN_CONTRACTS_PATH=/path/to/earn pnpm gen:tempo-earn-abis`.
// Update this revision only after the matching Earn release has been reviewed.
// The checkout must be clean with recursive submodules initialized.
const checkMode = process.argv.includes('--check')
const repoRoot = Path.resolve(import.meta.dirname, '..')
const earnCommit = '454fa260ded101f970ee7d6bafebf4c3b6ec9095'
const checkout = (() => {
  const path = process.env.EARN_CONTRACTS_PATH
  if (!path)
    throw new Error(
      '`EARN_CONTRACTS_PATH` must point to a local tempoxyz/earn checkout.',
    )
  return path
})()

const abisOut = Path.resolve(repoRoot, 'src/tempo/Abis.ts')
const contractsOut = Path.resolve(repoRoot, 'test/src/tempo/earnContracts.ts')
const earnMarker = '// Earn source: tempoxyz/earn at '

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

const abiSlices: readonly {
  contracts: readonly string[]
  description: string
  errors?: true | undefined
  events?: true | readonly string[] | undefined
  exportName: string
  functions?: true | readonly string[] | undefined
}[] = [
  {
    contracts: ['ERC4626EngineFactory'],
    description: 'ABI of the ERC-4626 engine factory contract.',
    errors: true,
    events: ['ERC4626EngineDeployed'],
    exportName: 'erc4626EngineFactory',
    functions: ['computeEngineSalt', 'deploy', 'predictEngine'],
  },
  {
    contracts: ['EarnFactory'],
    description: 'ABI of the Earn factory contract.',
    errors: true,
    events: ['EarnStackDeployed'],
    exportName: 'earnFactory',
    functions: [
      'computeEarnShareSalt',
      'deploy',
      'earnFeesImplementation',
      'earnVaultImplementation',
      'predictEarnFees',
      'predictEarnShare',
      'tip20Factory',
    ],
  },
  {
    contracts: ['ERC4626Engine'],
    description: 'ABI of the ERC-4626 vault engine contract.',
    errors: true,
    events: true,
    exportName: 'erc4626Engine',
    functions: [
      'acceptOwnership',
      'asset',
      'baseAsset',
      'earnVault',
      'initializeEarnVault',
      'name',
      'owner',
      'pendingOwner',
      'renounceOwnership',
      'symbol',
      'transferOwnership',
      'vault',
    ],
  },
  {
    contracts: ['EarnVault'],
    description: 'ABI of the Earn vault contract.',
    exportName: 'earnVault',
  },
  {
    contracts: ['EarnFees'],
    description: 'ABI of the Earn fees contract.',
    exportName: 'earnFees',
  },
  {
    contracts: ['IEarnEngine', 'IEarnEngineRedeem', 'IEarnEngineExactWithdraw'],
    description: 'ABI of the synchronous Earn engine interfaces.',
    exportName: 'earnEngine',
    functions: true,
  },
  {
    contracts: ['IEarnEngineAsyncRedeem'],
    description: 'ABI of the asynchronous Earn engine interface.',
    exportName: 'earnEngineAsyncRedeem',
    functions: true,
  },
  {
    contracts: ['IEarnEngineInKindDeposit'],
    description: 'ABI of the in-kind Earn engine interface.',
    exportName: 'earnEngineInKindDeposit',
    functions: true,
  },
  {
    contracts: ['EarnContributionController'],
    description: 'ABI of the Earn contribution controller contract.',
    errors: true,
    events: ['Funded'],
    exportName: 'earnContributionController',
    functions: ['active', 'fund', 'setActive'],
  },
  {
    contracts: ['VedaEngine'],
    description: 'ABI of the Veda vault engine contract.',
    errors: true,
    events: true,
    exportName: 'vedaEngine',
    functions: ['claimRedeem', 'getClaim', 'rate', 'settled'],
  },
  {
    contracts: ['SingleZoneEarnRouter'],
    description: 'ABI of the single-Zone Earn router contract.',
    errors: true,
    events: true,
    exportName: 'earnRouter',
    functions: true,
  },
]

const deployables: readonly { contract: string; exportName: string }[] = [
  { contract: 'Simple4626Vault', exportName: 'simple4626Vault' },
  {
    contract: 'ERC4626EngineFactory',
    exportName: 'erc4626EngineFactory',
  },
  { contract: 'ERC4626Engine', exportName: 'erc4626Engine' },
  { contract: 'EarnVault', exportName: 'earnVault' },
  { contract: 'EarnFees', exportName: 'earnFees' },
  { contract: 'EarnFactory', exportName: 'earnFactory' },
  {
    contract: 'DemoTokenAuthority',
    exportName: 'demoTokenAuthority',
  },
  { contract: 'SingleZoneEarnRouter', exportName: 'earnRouter' },
  {
    contract: 'EarnContributionController',
    exportName: 'earnContributionController',
  },
]

function inspect(contract: string, field: string) {
  return execFileSync('forge', ['inspect', contract, field, '--json'], {
    cwd: checkout,
    encoding: 'utf8',
  })
}

function normalizeParameter(parameter: AbiParameter): AbiParameter {
  const { internalType: _, components, ...value } = parameter
  return {
    ...value,
    ...(components ? { components: components.map(normalizeParameter) } : {}),
  }
}

function normalizeItem(item: AbiEntry): AbiEntry {
  return {
    ...item,
    ...(item.inputs ? { inputs: item.inputs.map(normalizeParameter) } : {}),
    ...(item.outputs ? { outputs: item.outputs.map(normalizeParameter) } : {}),
  }
}

function sliceAbi(
  abi: readonly AbiEntry[],
  slice: (typeof abiSlices)[number],
): readonly AbiEntry[] {
  const { errors, events, functions } = slice
  if (!errors && !events && !functions) return abi
  const keep = (
    filter: true | readonly string[] | undefined,
    name?: string | undefined,
  ) => filter === true || (filter ?? []).includes(name ?? '')
  return abi.filter((item) => {
    if (item.type === 'function') return keep(functions, item.name)
    if (item.type === 'event') return keep(events, item.name)
    if (item.type === 'error') return errors === true
    return false
  })
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
      const [type, name] = field.split(/\s+/)
      if (!type || !name) throw new Error(`unparsable field in ${file}`)
      return { name, type }
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

function routerCallbackDataParameter() {
  const zone = Path.join(checkout, 'src/interfaces/external/tempo/IZone.sol')
  const router = Path.join(checkout, 'src/router/SingleZoneEarnRouter.sol')
  const encrypted = structComponents(zone, 'EncryptedDepositPayload')
  const zoneReturn = structComponents(router, 'ZoneReturn', {
    EncryptedDepositPayload: encrypted,
  })
  const components = structComponents(router, 'CallbackData', {
    ZoneReturn: zoneReturn,
  })
  return [{ components, name: 'callbackData', type: 'tuple' }]
}

function generateAbiSlice(commit: string) {
  const slices = abiSlices.map((slice) => {
    const seen = new Set<string>()
    const abi = slice.contracts
      .flatMap((contract) => JSON.parse(inspect(contract, 'abi')) as AbiEntry[])
      .map(normalizeItem)
      .filter((item) => {
        const signature = item.name
          ? AbiItem.getSignature(item as AbiItem.AbiItem)
          : item.type
        if (seen.has(signature)) return false
        seen.add(signature)
        return true
      })
    return `/** ${slice.description} */\nexport const ${slice.exportName} = ${JSON.stringify(sliceAbi(abi, slice))} as const`
  })
  return `${earnMarker}${commit}. Do not modify manually.\n\n${slices.join('\n\n')}\n\n/** ABI parameter for encoding \`SingleZoneEarnRouter.CallbackData\`. */\nexport const earnRouterCallbackData = ${JSON.stringify(routerCallbackDataParameter())} as const\n`
}

function generateContracts(commit: string) {
  const contracts = deployables.map(({ contract, exportName }) => {
    const abi = (JSON.parse(inspect(contract, 'abi')) as AbiEntry[]).map(
      normalizeItem,
    )
    const bytecode = inspect(contract, 'bytecode').trim()
    return `export const ${exportName} = {\n  abi: ${JSON.stringify(abi)},\n  bytecode: '${bytecode}',\n} as const`
  })
  return `// Generated with \`pnpm gen:tempo-earn-abis\`. Do not modify manually.\n${earnMarker}${commit}.\n\n${contracts.join('\n\n')}\n`
}

function replaceAbiSlice(content: string, slice: string) {
  const index = content.indexOf(earnMarker)
  const base = (index === -1 ? content : content.slice(0, index)).trimEnd()
  return `${base}\n\n${slice}`
}

const commit = (() => {
  const status = execFileSync('git', ['status', '--porcelain'], {
    cwd: checkout,
    encoding: 'utf8',
  }).trim()
  if (status)
    throw new Error('`EARN_CONTRACTS_PATH` must point to a clean checkout.')
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: checkout,
    encoding: 'utf8',
  }).trim()
  if (commit !== earnCommit)
    throw new Error(
      `\`EARN_CONTRACTS_PATH\` must point to tempoxyz/earn at ${earnCommit}.`,
    )
  const uninitializedSubmodule = execFileSync(
    'git',
    ['submodule', 'status', '--recursive'],
    { cwd: checkout, encoding: 'utf8' },
  )
    .split('\n')
    .some((line) => line.startsWith('-'))
  if (uninitializedSubmodule)
    throw new Error(
      '`EARN_CONTRACTS_PATH` must have recursively initialized submodules.',
    )
  return commit
})()
const generatedAbis = replaceAbiSlice(
  Fs.readFileSync(abisOut, 'utf8'),
  generateAbiSlice(commit),
)
const generatedContracts = generateContracts(commit)

if (checkMode) {
  const checkDir = Fs.mkdtempSync(Path.join(repoRoot, 'tempo-earn-abis-check-'))
  const abisCheck = Path.join(checkDir, 'Abis.ts')
  const contractsCheck = Path.join(checkDir, 'earnContracts.ts')
  const candidates = [abisCheck, contractsCheck]
  try {
    Fs.writeFileSync(abisCheck, generatedAbis)
    Fs.writeFileSync(contractsCheck, generatedContracts)
    execFileSync('pnpm', ['exec', 'vp', 'fmt', ...candidates], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    const earnTail = (content: string) => {
      const index = content.indexOf(earnMarker)
      return index === -1 ? undefined : content.slice(index)
    }
    const stale = [
      ...(earnTail(Fs.readFileSync(abisCheck, 'utf8')) !==
      earnTail(Fs.readFileSync(abisOut, 'utf8'))
        ? [abisOut]
        : []),
      ...(Fs.readFileSync(contractsCheck, 'utf8') !==
      Fs.readFileSync(contractsOut, 'utf8')
        ? [contractsOut]
        : []),
    ]
    if (stale.length > 0)
      throw new Error(
        `Generated Earn outputs are stale: ${stale
          .map((file) => Path.relative(repoRoot, file))
          .join(', ')}.`,
      )
    console.log('✓ Earn ABIs are up to date')
  } finally {
    Fs.rmSync(checkDir, { force: true, recursive: true })
  }
} else {
  Fs.writeFileSync(abisOut, generatedAbis)
  Fs.writeFileSync(contractsOut, generatedContracts)
  console.log(
    `✓ Generated ${abiSlices.length} Earn ABI slices and ${deployables.length} deploy artifacts`,
  )
}
