import { execFileSync } from 'node:child_process'
import * as Fs from 'node:fs'
import * as Path from 'node:path'
import { AbiItem } from 'ox'

const checkMode = process.argv.includes('--check')
const repoRoot = Path.resolve(import.meta.dirname, '..')
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
  errors?: true | undefined
  events?: true | readonly string[] | undefined
  exportName: string
  functions?: true | readonly string[] | undefined
}[] = [
  {
    contracts: ['EarnFactory'],
    errors: true,
    events: ['EarnStackDeployed'],
    exportName: 'earnFactory',
    functions: ['computeShareSalt', 'deploy', 'predictShareToken'],
  },
  {
    contracts: ['ERC4626Engine'],
    errors: true,
    events: true,
    exportName: 'erc4626Engine',
    functions: [
      'acceptOwnership',
      'initializeCore',
      'owner',
      'pendingOwner',
      'renounceOwnership',
      'transferOwnership',
    ],
  },
  { contracts: ['VaultAdapter'], exportName: 'vaultAdapter' },
  {
    contracts: [
      'IVaultEngine',
      'IVaultEngineSync',
      'IVaultEngineExactWithdraw',
    ],
    exportName: 'vaultEngine',
    functions: true,
  },
  {
    contracts: ['IVaultEngineAsync'],
    exportName: 'vaultEngineAsync',
    functions: true,
  },
  {
    contracts: ['IVaultEngineShares'],
    exportName: 'vaultEngineShares',
    functions: true,
  },
  {
    contracts: ['VaultRewards'],
    errors: true,
    events: ['Funded'],
    exportName: 'vaultRewards',
    functions: ['active', 'fund', 'setActive'],
  },
  {
    contracts: ['VedaEngine'],
    errors: true,
    events: true,
    exportName: 'vedaEngine',
    functions: ['claimRedeem', 'getClaim', 'rate', 'settled'],
  },
  {
    contracts: ['ZoneGateway'],
    events: ['EarnDeposit', 'EarnRedeem'],
    exportName: 'zoneGateway',
    functions: [
      'defaultSwapper',
      'shareToken',
      'supportsFlow',
      'vaultAdapter',
      'vaultAsset',
      'zoneId',
      'zoneMessenger',
      'zonePortal',
    ],
  },
  {
    contracts: ['ZoneGatewayBase'],
    events: true,
    exportName: 'zoneGatewayBase',
    functions: [
      'acceptOwnership',
      'depositSwapperFor',
      'owner',
      'pendingOwner',
      'redeemSwapperFor',
      'renounceOwnership',
      'setDepositRoute',
      'setRedeemRoute',
      'transferOwnership',
    ],
  },
]

const deployables: readonly { contract: string; exportName: string }[] = [
  { contract: 'Simple4626Vault', exportName: 'simple4626Vault' },
  { contract: 'ERC4626Engine', exportName: 'erc4626Engine' },
  { contract: 'VaultAdapter', exportName: 'vaultAdapter' },
  { contract: 'EarnFactory', exportName: 'earnFactory' },
  { contract: 'ZoneGateway', exportName: 'zoneGateway' },
  { contract: 'VaultRewards', exportName: 'vaultRewards' },
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

// CallbackData is decoded directly and does not appear in a contract ABI.
function callbackDataParameter(): AbiParameter[] {
  const encrypted = extractStruct(
    Path.join(checkout, 'src/interfaces/IZonePortal.sol'),
    'EncryptedDepositPayload',
  )
  const components = extractStruct(
    Path.join(checkout, 'src/zone-gateway/ZoneGateway.sol'),
    'CallbackData',
  ).map(({ name, type }) => {
    if (type === 'Flow') return { name, type: 'uint8' }
    if (type === 'IZonePortal.EncryptedDepositPayload')
      return { components: encrypted, name, type: 'tuple' }
    return { name, type }
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
    return `export const ${slice.exportName} = ${JSON.stringify(sliceAbi(abi, slice))} as const`
  })
  return `${earnMarker}${commit}. Do not modify manually.\n\n${slices.join('\n\n')}\n\n// \`ZoneGateway.CallbackData\` parameter for \`encodeAbiParameters\`.\nexport const zoneGatewayCallbackData = ${JSON.stringify(callbackDataParameter())} as const\n`
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
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: checkout,
    encoding: 'utf8',
  }).trim()
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
    execFileSync(
      'pnpm',
      ['exec', 'biome', 'check', '--write', '--unsafe', ...candidates],
      { cwd: repoRoot, stdio: 'ignore' },
    )
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
