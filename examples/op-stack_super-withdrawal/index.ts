import {
  type Address,
  createPublicClient,
  createWalletClient,
  defineChain,
  type Hash,
  type Hex,
  http,
  isAddress,
  isAddressEqual,
  type TransactionReceipt,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  buildInitiateWithdrawal,
  buildProveWithdrawal,
  finalizeWithdrawal,
  getPortalVersion,
  initiateWithdrawal,
  isSuperGameType,
  proveWithdrawal,
  waitToFinalize,
  waitToProve,
} from 'viem/op-stack'

const portalConfigAbi = [
  {
    inputs: [],
    name: 'disputeGameFactory',
    outputs: [
      {
        internalType: 'contract IDisputeGameFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respectedGameType',
    outputs: [{ internalType: 'GameType', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemConfig',
    outputs: [
      { internalType: 'contract ISystemConfig', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const systemConfigAbi = [
  {
    inputs: [],
    name: 'l2ChainId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function requireAddress(name: string) {
  const value = requireEnv(name)
  if (!isAddress(value)) throw new Error(`${name} is not a valid address.`)
  return value
}

function optionalAddress(name: string) {
  const value = process.env[name]
  if (!value) return undefined
  if (!isAddress(value)) throw new Error(`${name} is not a valid address.`)
  return value
}

function requireChainId(name: string) {
  const value = Number(requireEnv(name))
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer.`)
  return value
}

function optionalBigInt(name: string) {
  const value = process.env[name]
  if (!value) return undefined
  return BigInt(value)
}

function devnetChain({
  id,
  multicall3Address,
  name,
  rpcUrl,
}: {
  id: number
  multicall3Address?: Address | undefined
  name: string
  rpcUrl: string
}) {
  return defineChain({
    contracts: multicall3Address
      ? {
          multicall3: {
            address: multicall3Address,
            blockCreated: 0,
          },
        }
      : undefined,
    id,
    name,
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
  })
}

function assertSuccess(receipt: TransactionReceipt, label: string) {
  if (receipt.status !== 'success')
    throw new Error(`${label} transaction reverted.`)
}

function logHash(label: string, hash: Hash) {
  console.log(`${label}: ${hash}`)
}

const l1RpcUrl = requireEnv('L1_RPC_URL')
const l2RpcUrl = requireEnv('L2_RPC_URL')
const privateKey = requireEnv('PRIVATE_KEY') as Hex
const portalAddress = requireAddress('PORTAL_ADDRESS')
const multicall3Address =
  optionalAddress('MULTICALL3_ADDRESS') ??
  '0xcA11bde05977b3631167028862bE2a173976CA11'
const disputeGameFactoryAddress = requireAddress('DISPUTE_GAME_FACTORY_ADDRESS')
const l2OutputOracleAddress = optionalAddress('L2_OUTPUT_ORACLE_ADDRESS')
const withdrawalAmount = BigInt(process.env.WITHDRAWAL_AMOUNT_WEI ?? '1000')
const initiateWithdrawalTransactionGas =
  optionalBigInt('INITIATE_WITHDRAWAL_TRANSACTION_GAS') ?? 200_000n

const account = privateKeyToAccount(privateKey)
const l1Chain = devnetChain({
  id: requireChainId('L1_CHAIN_ID'),
  multicall3Address,
  name: 'L1 Devnet',
  rpcUrl: l1RpcUrl,
})
const l2Chain = devnetChain({
  id: requireChainId('L2_CHAIN_ID'),
  name: 'L2 Devnet',
  rpcUrl: l2RpcUrl,
})

const publicClientL1 = createPublicClient({
  chain: l1Chain,
  transport: http(l1RpcUrl),
})
const walletClientL1 = createWalletClient({
  account,
  chain: l1Chain,
  transport: http(l1RpcUrl),
})
const publicClientL2 = createPublicClient({
  chain: l2Chain,
  transport: http(l2RpcUrl),
})
const walletClientL2 = createWalletClient({
  account,
  chain: l2Chain,
  transport: http(l2RpcUrl),
})

const contractOverrides = {
  disputeGameFactoryAddress,
  l2OutputOracleAddress,
  portalAddress,
} as const

const portalVersion = await getPortalVersion(publicClientL1, { portalAddress })
if (portalVersion.major < 3 && !l2OutputOracleAddress)
  throw new Error('L2_OUTPUT_ORACLE_ADDRESS is required for legacy Portal.')
if (portalVersion.major >= 3) {
  const [portalDisputeGameFactoryAddress, systemConfigAddress] =
    await Promise.all([
      publicClientL1.readContract({
        abi: portalConfigAbi,
        address: portalAddress,
        functionName: 'disputeGameFactory',
      }),
      publicClientL1.readContract({
        abi: portalConfigAbi,
        address: portalAddress,
        functionName: 'systemConfig',
      }),
    ])
  const portalL2ChainId = await publicClientL1.readContract({
    abi: systemConfigAbi,
    address: systemConfigAddress,
    functionName: 'l2ChainId',
  })

  if (
    !isAddressEqual(portalDisputeGameFactoryAddress, disputeGameFactoryAddress)
  )
    throw new Error(
      `DISPUTE_GAME_FACTORY_ADDRESS ${disputeGameFactoryAddress} does not match Portal disputeGameFactory ${portalDisputeGameFactoryAddress}.`,
    )
  if (portalL2ChainId !== BigInt(l2Chain.id))
    throw new Error(
      `PORTAL_ADDRESS is configured for L2 chain ${portalL2ChainId}, but L2_CHAIN_ID is ${l2Chain.id}.`,
    )
}
const usesSuperRoots =
  portalVersion.major >= 3 &&
  isSuperGameType(
    Number(
      await publicClientL1.readContract({
        abi: portalConfigAbi,
        address: portalAddress,
        functionName: 'respectedGameType',
      }),
    ),
  )

console.log(`Withdrawing ${withdrawalAmount} wei from L2 to L1.`)
console.log(`Account: ${account.address}`)
console.log(
  `Portal version: ${portalVersion.major}.${portalVersion.minor}.${portalVersion.patch}`,
)
console.log(`Uses super roots: ${usesSuperRoots}`)

const startingBalance = await publicClientL1.getBalance({
  address: account.address,
})

const initiateArgs = await buildInitiateWithdrawal(publicClientL1, {
  account,
  to: account.address,
  value: withdrawalAmount,
})
const initiateHash = await initiateWithdrawal(walletClientL2, {
  ...initiateArgs,
  gas: initiateWithdrawalTransactionGas,
})
logHash('Initiated withdrawal on L2', initiateHash)

const l2Receipt = await publicClientL2.waitForTransactionReceipt({
  hash: initiateHash,
})
assertSuccess(l2Receipt, 'Initiate withdrawal')
const l2Block = await publicClientL2.getBlock({
  blockNumber: l2Receipt.blockNumber,
})
if (l2Block.timestamp === undefined)
  throw new Error('L2 withdrawal block timestamp is unavailable.')
console.log(`L2 withdrawal block: ${l2Receipt.blockNumber}`)
console.log(`L2 withdrawal timestamp: ${l2Block.timestamp}`)

const { game, withdrawal } = await waitToProve(publicClientL1, {
  ...contractOverrides,
  ...(usesSuperRoots ? { l2Timestamp: l2Block.timestamp } : {}),
  receipt: l2Receipt,
} as never)
console.log(`Dispute game/output index: ${game.index}`)

const proveArgs = await buildProveWithdrawal(publicClientL2, {
  account,
  game,
  withdrawal,
})
const { targetChain: _targetChain, ...proveRequest } = proveArgs
void _targetChain
const proveHash = await proveWithdrawal(walletClientL1, {
  ...proveRequest,
  portalAddress,
} as never)
logHash('Proved withdrawal on L1', proveHash)

const proveReceipt = await publicClientL1.waitForTransactionReceipt({
  hash: proveHash,
})
assertSuccess(proveReceipt, 'Prove withdrawal')

await waitToFinalize(publicClientL1, {
  ...contractOverrides,
  withdrawalHash: withdrawal.withdrawalHash,
} as never)

const finalizeHash = await finalizeWithdrawal(walletClientL1, {
  account,
  portalAddress,
  withdrawal,
} as never)
logHash('Finalized withdrawal on L1', finalizeHash)

const finalizeReceipt = await publicClientL1.waitForTransactionReceipt({
  hash: finalizeHash,
})
assertSuccess(finalizeReceipt, 'Finalize withdrawal')

const endingBalance = await publicClientL1.getBalance({
  address: account.address,
})

console.log(`Starting L1 balance: ${startingBalance}`)
console.log(`Ending L1 balance: ${endingBalance}`)
console.log(`L1 balance delta: ${endingBalance - startingBalance}`)
