import type { Address } from 'abitype'
import {
  type GetBlockErrorType,
  getBlock,
} from '../../actions/public/getBlock.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  Account,
  DeriveAccount,
  GetAccountParameter,
} from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { OneOf, Prettify } from '../../types/utils.js'
import { concat } from '../../utils/data/concat.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { contracts } from '../contractsZircuit.js'
import type { Withdrawal } from '../types/withdrawal.js'
import type { GetWithdrawalsErrorType } from '../utils/getWithdrawals.js'
import type { GetGameReturnType } from './getGame.js'
import type { GetL2OutputReturnType } from './getL2Output.js'
import type { ProveWithdrawalParameters } from './proveWithdrawal.js'

import { getStorageAt } from '../../actions/index.js'
import { getLogs } from '../../actions/index.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { extractWithdrawalMessageLogs } from '../utils/extractWithdrawalMessageLogs.js'
import { getWithdrawals } from '../utils/getWithdrawals.js'
import { buildProveWithdrawal } from './buildProveWithdrawal.js'

const outputRootProofVersion =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

// export type BuildProveWithdrawalParameters<
//   chain extends Chain | undefined = Chain | undefined,
//   account extends Account | undefined = Account | undefined,
//   chainOverride extends Chain | undefined = Chain | undefined,
//   accountOverride extends Account | Address | undefined =
//     | Account
//     | Address
//     | undefined,
//   _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
// > = GetAccountParameter<account, accountOverride, false> &
//   GetChainParameter<chain, chainOverride> & {
//     withdrawal: Withdrawal
//   } & OneOf<{ output: GetL2OutputReturnType } | { game: GetGameReturnType }>

export type BuildProveZircuitWithdrawalParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetAccountParameter<account, accountOverride, false> &
  GetChainParameter<chain, chainOverride> & {
    receipt: TransactionReceipt
    withdrawal?: Withdrawal
  } & OneOf<{ output: GetL2OutputReturnType } | { game: GetGameReturnType }>

export type BuildProveZircuitWithdrawalReturnType<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Prettify<
  Pick<
    ProveWithdrawalParameters,
    'l2OutputIndex' | 'outputRootProof' | 'withdrawalProof' | 'withdrawal'
  > & {
    account: DeriveAccount<account, accountOverride>
    targetChain: DeriveChain<chain, chainOverride>
  }
>

export type BuildProveZircuitWithdrawalErrorType =
  | GetBlockErrorType
  | GetWithdrawalsErrorType
  | ErrorType

/**
 * Builds the transaction that proves a withdrawal was initiated on an L2. Used in the Withdrawal flow.
 *
 * @param client - Client to use
 * @param parameters - {@link BuildProveZircuitWithdrawalParameters}
 * @returns The prove withdraw transaction request. {@link BuildProveZircuitWithdrawalReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { buildProveZircuitWithdrawal } from 'viem/op-stack'
 *
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const args = await buildProveZircuitWithdrawal(publicClientL2, {
 *   output: { ... },
 *   receipt : { ... },
 * })
 */
export async function buildProveZircuitWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: BuildProveZircuitWithdrawalParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<
  BuildProveZircuitWithdrawalReturnType<
    chain,
    account,
    chainOverride,
    accountOverride
  >
> {
  const { account, chain = client.chain, game, output, receipt } = args

  // Extract withdrawal from receipt
  const [withdrawal] = args.withdrawal
    ? [args.withdrawal]
    : getWithdrawals(receipt)
  const { withdrawalHash } = withdrawal

  // console.log('withdrawal', withdrawal);
  // console.log('withdrawalHash', withdrawalHash);

  // Get the nonce from the original withdrawal transaction
  // Extract the version to see if should return old withdrawals proof or new withdrawals proof
  const withdrawalLog = extractWithdrawalMessageLogs({ logs: receipt.logs })[0]
  if (!withdrawalLog) {
    throw new Error('No withdrawal log found in receipt')
  }

  const { version: msgVersion } = extractNonceAndVersion(withdrawalLog)

  // console.log(`msgVersion`, msgVersion);

  // Legacy withdrawals use old proofs -> version == 1
  if (msgVersion === 1) {
    // First check if withdrawal was successfully extracted
    if (!withdrawal) {
      throw new Error('No withdrawal found in receipt')
    }

    return buildProveWithdrawal(client, {
      account,
      chain,
      withdrawal,
      ...(game ? { game } : { output }),
    }) as unknown as BuildProveZircuitWithdrawalReturnType<
      chain,
      account,
      chainOverride,
      accountOverride
    >
  }
  // New withdrawals use new proofs -> version == 2
  if (msgVersion === 2) {
    // Extract block of transaction execution
    // and block of outputRoot
    const l2TxBlockNumber = receipt.blockNumber
    const { l2BlockNumber: l2OutputRootBlockNumber } = game ?? output

    // console.log(`l2TxBlockNumber`, l2TxBlockNumber);
    // console.log(`l2OutputRootBlockNumber`, l2OutputRootBlockNumber);

    // Initialize left and right hashes for merkleTree computation
    const rightHashes: Hex[] = initializeRightHashes()
    const leftHashes: Hex[] = await initializeLeftHashes(
      client,
      l2TxBlockNumber,
    )

    // console.log(`leftHashes`, leftHashes);
    // console.log(`rightHashes`, rightHashes);

    // Fetch all withdrawals submitted between the two blocks
    const intermediateWithdrawals = await fetchIntermediateWithdrawals(
      client,
      l2TxBlockNumber,
      l2OutputRootBlockNumber,
    )

    // console.log(`intermediateWithdrawals`, intermediateWithdrawals);

    // Build the merkleTree for all intermediate withdrawals
    const { merkleTree, treeHeight, withdrawalRoot } = await buildMerkleTree(
      client,
      intermediateWithdrawals,
      leftHashes,
      rightHashes,
      l2OutputRootBlockNumber,
    )

    // console.log(`merkleTree`, merkleTree);
    // console.log(`treeHeight`, treeHeight);
    // console.log(`withdrawalRoot`, withdrawalRoot);

    // Extract the withdrawal proof for current withdrawal from the tree
    const withdrawalProof: Hex = buildWithdrawalProof(
      withdrawalHash,
      merkleTree,
      treeHeight,
    )

    // console.log(`withdrawalProof`, withdrawalProof);

    // Fetch the outputRoot proof parts from the outputRoot block
    const outputRootBlock = await getBlock(client, {
      blockNumber: l2OutputRootBlockNumber,
    })

    // console.log(`outputRootBlock`, outputRootBlock);

    return {
      account,
      l2OutputIndex: game?.index ?? output?.outputIndex,
      outputRootProof: {
        latestBlockhash: outputRootBlock.hash,
        messagePasserStorageRoot: withdrawalRoot,
        stateRoot: outputRootBlock.stateRoot,
        version: outputRootProofVersion,
      },
      targetChain: chain,
      withdrawalProof: [withdrawalProof],
      withdrawal,
    } as unknown as BuildProveZircuitWithdrawalReturnType<
      chain,
      account,
      chainOverride,
      accountOverride
    >
  }

  throw new Error('Unsupported version for withdrawal proof')
}

/** @internal */
// rightHahses are the hashes of the right side of the tree
// right with respect to the msgNonce
// they are used to compute the new root whenever a new leaf is added
// they are constant -> rightHashes[i+1]=keccak(rightHashes[i] || rightHashes[i])
export function initializeRightHashes(): Hex[] {
  return [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5',
    '0xb4c11951957c6f8f642c4af61cd6b24640fec6dc7fc607ee8206a99e92410d30',
    '0x21ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85',
    '0xe58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a19344',
    '0x0eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d',
    '0x887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968',
    '0xffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f83',
    '0x9867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756af',
    '0xcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0',
    '0xf9dc3e7fe016e050eff260334f18a5d4fe391d82092319f5964f2e2eb7c1c3a5',
    '0xf8b13a49e282f609c317a833fb8d976d11517c571d1221a265d25af778ecf892',
    '0x3490c6ceeb450aecdc82e28293031d10c7d73bf85e57bf041a97360aa2c5d99c',
    '0xc1df82d9c4b87413eae2ef048f94b4d3554cea73d92b0f7af96e0271c691e2bb',
    '0x5c67add7c6caf302256adedf7ab114da0acfe870d449a3a489f781d659e8becc',
    '0xda7bce9f4e8618b6bd2f4132ce798cdc7a60e7e1460a7299e3c6342a579626d2',
    '0x2733e50f526ec2fa19a22b31e8ed50f23cd1fdf94c9154ed3a7609a2f1ff981f',
    '0xe1d3b5c807b281e4683cc6d6315cf95b9ade8641defcb32372f1c126e398ef7a',
    '0x5a2dce0a8a7f68bb74560f8f71837c2c2ebbcbf7fffb42ae1896f13f7c7479a0',
    '0xb46a28b6f55540f89444f63de0378e3d121be09e06cc9ded1c20e65876d36aa0',
    '0xc65e9645644786b620e2dd2ad648ddfcbf4a7e5b1a3a4ecfe7f64667a3f0b7e2',
    '0xf4418588ed35a2458cffeb39b93d26f18d2ab13bdce6aee58e7b99359ec2dfd9',
    '0x5a9c16dc00d6ef18b7933a6f8dc65ccb55667138776f7dea101070dc8796e377',
    '0x4df84f40ae0c8229d0d6069e5c8f39a7c299677a09d367fc7b05e3bc380ee652',
    '0xcdc72595f74c7b1043d0e1ffbab734648c838dfb0527d971b602bc216c9619ef',
    '0x0abf5ac974a1ed57f4050aa510dd9c74f508277b39d7973bb2dfccc5eeb0618d',
    '0xb8cd74046ff337f0a7bf2c8e03e10f642c1886798d71806ab1e888d9e5ee87d0',
    '0x838c5655cb21c6cb83313b5a631175dff4963772cce9108188b34ac87c81c41e',
    '0x662ee4dd2dd7b2bc707961b1e646c4047669dcb6584f0d8d770daf5d7e7deb2e',
    '0x388ab20e2573d171a88108e79d820e98f26c0b84aa8b2f4aa4968dbb818ea322',
    '0x93237c50ba75ee485f4c22adf2f741400bdf8d6a9cc7df7ecae576221665d735',
    '0x8448818bb4ae4562849e949e17ac16e0be16688e156b5cf15e098c627c0056a9',
    '0x27ae5ba08d7291c96c8cbddcc148bf48a6d68c7974b94356f53754ef6171d757',
    '0xbf558bebd2ceec7f3c5dce04a4782f88c2c6036ae78ee206d0bc5289d20461a2',
    '0xe21908c2968c0699040a6fd866a577a99a9d2ec88745c815fd4a472c789244da',
    '0xae824d72ddc272aab68a8c3022e36f10454437c1886f3ff9927b64f232df414f',
    '0x27e429a4bef3083bc31a671d046ea5c1f5b8c3094d72868d9dfdc12c7334ac5f',
    '0x743cc5c365a9a6a15c1f240ac25880c7a9d1de290696cb766074a1d83d927816',
    '0x4adcf616c3bfabf63999a01966c998b7bb572774035a63ead49da73b5987f347',
    '0x75786645d0c5dd7c04a2f8a75dcae085213652f5bce3ea8b9b9bedd1cab3c5e9',
  ] as const as Hex[]
}

/** @internal */
// Computes the height of the withdrawal tree from the msgNonce
// The height is the number of bits needed to represent the msgNonce
export function computeHeightFromMsgNonce(msgNonceBigInt: bigint): number {
  // Check if msgNonce is a non-negative integer
  if (msgNonceBigInt < 0n) {
    throw new Error('msgNonce must be a non-negative integer')
  }

  // Maximum allowed value for msgNonce is 2^40
  // This is hardcoded in the L2ToL1MessagePasser contract
  const MAX_MSG_NONCE = BigInt(1) << BigInt(40) // 2^40 = 1,099,511,627,776

  // Check if msgNonce exceeds the maximum allowed value
  if (msgNonceBigInt > MAX_MSG_NONCE) {
    throw new Error(
      `msgNonce exceeds maximum allowed value (2^40): ${msgNonceBigInt.toString()}`,
    )
  }

  // if msgNonce is 0, no leaves have been appended to the tree, so height is 0
  if (msgNonceBigInt === 0n) return 0

  // Otherwise, msgNonce is the index of the NEXT leaf
  // We compute tree hight at time of last leaf insertion
  const height = merkleTreeHeight(Number(msgNonceBigInt) - 1)

  return height
}

/** @internal */
// Computes the height of the tree from node indexed nodeIndex
// The height is the number of bits needed to represent the msgNonce
function merkleTreeHeight(nodeIndex: number): number {
  let index = nodeIndex
  if (index < 0) {
    throw new Error('Node index must be a non-negative integer')
  }

  let height = 1
  while (index > 0) {
    height++
    index >>= 1
  }

  return height
}

/** @internal */
// leftHashes are read from the L2ToL1MessagePasser storage
// We need treeHeight many left hashes to compute withdrawal proofs
export async function initializeLeftHashes(
  client: Client<Transport, Chain | undefined>,
  l2TxBlockNumber: bigint,
): Promise<Hex[]> {
  const leftHashes: Hex[] = Array(40).fill(
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  )

  // If block number is 0, return all zeros
  if (l2TxBlockNumber === 0n) {
    return leftHashes
  }

  // Fetch nonce at the end of block before the L2 transaction
  const msgNonceBeforeL2Tx = await getStorageAt(client, {
    address: contracts.l2ToL1MessagePasser.address,
    blockNumber: l2TxBlockNumber - 1n,
    slot: contracts.l2ToL1MessagePasser.msgNonceStorageSlot,
  })

  if (!msgNonceBeforeL2Tx) {
    throw new Error('Failed to get message nonce from storage')
  }
  const msgNonceBigInt = hexToBigInt(msgNonceBeforeL2Tx, { size: 32 })

  const treeHeight = computeHeightFromMsgNonce(msgNonceBigInt)

  // Get left hashes from storage
  const promises = Array(treeHeight)
    .fill(0)
    .map((_, i) =>
      getStorageAt(client, {
        address: contracts.l2ToL1MessagePasser.address,
        blockNumber: l2TxBlockNumber - 1n,
        slot: toHex(i + contracts.l2ToL1MessagePasser.leftHashesOffset, {
          size: 32,
        }),
      }),
    )

  const results = await Promise.all(promises)

  // If any result is undefined, throw error
  for (let i = 0; i < treeHeight; i++) {
    const hash = results[i]
    if (!hash) {
      throw new Error(`Failed to get left hash at height ${i} from storage`)
    }
    leftHashes[i] = hash
  }

  return leftHashes
}

/** @internal */
// Fetch all withdrawals between block a and b
// check for correctness and return
export async function fetchIntermediateWithdrawals(
  client: Client,
  fromBlockNumber: bigint,
  toBlockNumber: bigint,
): Promise<[number, Hex][]> {
  // Set block range limit (Zircuit RPC providers has a 50k block limit)
  const BLOCK_RANGE_LIMIT = 20000n

  // Fetch all withdrawals between fromBlock and toBlock
  let submittedWithdrawalLogs: Log[] = []

  // Paginate through blocks
  let currentFromBlock = fromBlockNumber
  while (currentFromBlock <= toBlockNumber) {
    const currentToBlock =
      currentFromBlock + BLOCK_RANGE_LIMIT > toBlockNumber
        ? toBlockNumber
        : currentFromBlock + BLOCK_RANGE_LIMIT - 1n

    const logs = await getLogs(client, {
      address: contracts.l2ToL1MessagePasser.address,
      fromBlock: currentFromBlock,
      toBlock: currentToBlock,
      event: l2ToL1MessagePasserAbi.find(
        (x) => x.type === 'event' && x.name === 'MessagePassed',
      ),
    })

    submittedWithdrawalLogs = [...submittedWithdrawalLogs, ...logs]

    // Move to next block range
    currentFromBlock = currentToBlock + 1n
  }

  // Parse the logs using the helper function
  const parsedLogs = extractWithdrawalMessageLogs({
    logs: submittedWithdrawalLogs,
  })

  // Nonce has the version encoded in the high bits
  // We extract just the nonce and hash from each log
  const withdrawalTransactionsArray: [number, Hex][] = parsedLogs
    .map((log) => {
      const { nonce } = extractNonceAndVersion(log)
      return [nonce, log.args.withdrawalHash] as [number, Hex]
    })
    .sort((a, b) => a[0] - b[0]) // sort by nonce

  // Validate we have logs
  if (withdrawalTransactionsArray.length === 0) {
    throw new Error('No withdrawal logs found')
  }

  // Get the nonce at block before first withdrawal
  const msgNonceBeforeTxBlock =
    fromBlockNumber === 0n
      ? 0
      : // If block 0, start from 0
        Number(
          hexToBigInt(
            (await getStorageAt(client, {
              address: contracts.l2ToL1MessagePasser.address,
              blockNumber: fromBlockNumber - 1n,
              slot: contracts.l2ToL1MessagePasser.msgNonceStorageSlot,
            })) ??
              (() => {
                throw new Error(
                  'Failed to get nonce from block before transaction',
                )
              })(),
          ),
        )

  // Get the nonce at block before first withdrawal
  const msgNonceAfterOuptutRootBlock = Number(
    hexToBigInt(
      (await getStorageAt(client, {
        address: contracts.l2ToL1MessagePasser.address,
        blockNumber: toBlockNumber,
        slot: contracts.l2ToL1MessagePasser.msgNonceStorageSlot,
      })) ??
        (() => {
          throw new Error('Failed to get nonce from output root block')
        })(),
    ),
  )

  // Add check that final nonce is strictly greater than initial nonce
  if (msgNonceAfterOuptutRootBlock <= msgNonceBeforeTxBlock) {
    throw new Error(
      `Final block nonce (${msgNonceAfterOuptutRootBlock}) must be greater than initial block nonce (${msgNonceBeforeTxBlock}) - no withdrawals found`,
    )
  }

  // Check if nonces are consecutive
  for (let i = 1; i < withdrawalTransactionsArray.length; i++) {
    const prevNonce = withdrawalTransactionsArray[i - 1][0]
    const currentNonce = withdrawalTransactionsArray[i][0]
    if (currentNonce !== prevNonce + 1) {
      throw new Error(
        `Non-consecutive nonces found: ${prevNonce} and ${currentNonce}`,
      )
    }
  }

  // Check first nonce matches nonce from previous block + 1
  if (withdrawalTransactionsArray[0][0] !== msgNonceBeforeTxBlock) {
    throw new Error(
      `First withdrawal nonce ${withdrawalTransactionsArray[0][0]} does not follow previous block nonce ${msgNonceBeforeTxBlock}`,
    )
  }

  // Check last nonce matches final block nonce
  const lastNonce =
    withdrawalTransactionsArray[withdrawalTransactionsArray.length - 1][0]
  if (lastNonce !== msgNonceAfterOuptutRootBlock - 1) {
    throw new Error(
      `Last withdrawal nonce ${lastNonce} does not match final block nonce - 1 (${msgNonceAfterOuptutRootBlock - 1})`,
    )
  }

  return withdrawalTransactionsArray
}

/** @internal */
// Builds a withdrawal proof by collecting sibling hashes from the merkle tree
export function buildWithdrawalProof(
  withdrawalHash: Hex,
  merkleTree: Record<number, Hex>[],
  treeHeight: number,
): Hex {
  // Find the withdrawal nonce by checking level 0 of merkle tree
  const intermediateWithdrawals = Object.entries(merkleTree[0])
  const foundEntry = intermediateWithdrawals.find(
    ([, hash]) => hash === withdrawalHash,
  )

  if (!foundEntry) {
    throw new Error('Withdrawal hash not found in the merkle tree')
  }

  let msgNonce = Number(foundEntry[0])
  const siblingHashes: Hex[] = []

  // Collect sister hashes at each level
  for (let i = 0; i < treeHeight - 1; i++) {
    siblingHashes.push(merkleTree[i][msgNonce ^ 0x01])
    msgNonce = msgNonce >> 1
  }

  // Handle empty array case - return "0x" instead of concat([])
  if (siblingHashes.length === 0) {
    return '0x' as Hex
  }

  const withdrawalProof = concat(siblingHashes)

  return withdrawalProof
}

/** @internal */
interface MerkleTreeBuildResult {
  merkleTree: Record<number, Hex>[]
  treeHeight: number
  withdrawalRoot: Hex
}

/** @internal */
async function buildMerkleTree(
  client: Client,
  intermediateWithdrawals: [number, Hex][],
  leftHashes: Hex[],
  rightHashes: Hex[],
  l2OutputRootBlockNumber: bigint,
): Promise<MerkleTreeBuildResult> {
  const firstMsgNonce = intermediateWithdrawals[0][0]
  const lastMsgNonce =
    intermediateWithdrawals[intermediateWithdrawals.length - 1][0]
  const treeHeight = merkleTreeHeight(Number(lastMsgNonce))

  // Create array of maps to store the merkle tree nodes
  const merkleTree: Record<number, Hex>[] = Array.from(
    { length: treeHeight },
    () => ({}),
  )

  // Populate level 0 with withdrawal hashes
  for (const [nonce, withdrawalHash] of intermediateWithdrawals) {
    merkleTree[0][nonce] = withdrawalHash
  }

  let currentMinIndex = firstMsgNonce
  let currentMaxIndex = lastMsgNonce

  // Build tree level by level
  for (let level = 1; level < treeHeight; level++) {
    if ((currentMinIndex & 0x01) === 0x01) {
      merkleTree[level - 1][currentMinIndex - 1] = leftHashes[level - 1]
      merkleTree[level][currentMinIndex >> 1] = keccak256(
        concat([
          merkleTree[level - 1][currentMinIndex - 1],
          merkleTree[level - 1][currentMinIndex],
        ]),
      )
    }

    if ((currentMaxIndex & 0x01) === 0x00) {
      merkleTree[level - 1][currentMaxIndex + 1] = rightHashes[level - 1]
      merkleTree[level][currentMaxIndex >> 1] = keccak256(
        concat([
          merkleTree[level - 1][currentMaxIndex],
          merkleTree[level - 1][currentMaxIndex + 1],
        ]),
      )
    }

    for (
      let i = currentMinIndex + (currentMinIndex & 0x01);
      i < currentMaxIndex;
      i += 2
    ) {
      merkleTree[level][i >> 1] = keccak256(
        concat([merkleTree[level - 1][i], merkleTree[level - 1][i + 1]]),
      )
    }

    currentMinIndex >>= 1
    currentMaxIndex >>= 1
  }

  const computedRoot = merkleTree[treeHeight - 1][0]
  const expectedRoot =
    (await getStorageAt(client, {
      address: contracts.l2ToL1MessagePasser.address,
      blockNumber: l2OutputRootBlockNumber,
      slot: contracts.l2ToL1MessagePasser.withdrawalRootStorageSlot,
    })) ??
    (() => {
      throw new Error('Failed to get withdrawal root from storage')
    })()

  if (computedRoot !== expectedRoot) {
    throw new Error(
      [
        'Merkle root verification failed!',
        `Expected: ${expectedRoot}`,
        `Computed: ${computedRoot}`,
        `Tree height: ${treeHeight}`,
        `Leaf count: ${intermediateWithdrawals.length}`,
        `Merkle tree: ${JSON.stringify(merkleTree, null, 2)}`,
      ].join('\n'),
    )
  }

  return { merkleTree, treeHeight, withdrawalRoot: computedRoot }
}

/**
 * Extracts the nonce and version from a withdrawal message log
 * @param withdrawalLog The withdrawal message log to extract from
 * @returns Object containing the nonce and version
 * @internal
 */
function extractNonceAndVersion(withdrawalLog: { args: { nonce: bigint } }) {
  const NONCE_MASK = BigInt(
    '0x0000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
  )
  const VERSION_SHIFT = BigInt(240)
  const MAX_NONCE = BigInt(1) << BigInt(40) // 2^40

  const rawNonce = BigInt(withdrawalLog.args.nonce) & NONCE_MASK
  if (rawNonce >= MAX_NONCE) {
    throw new Error(
      `Nonce exceeds maximum allowed value (2^40): ${rawNonce.toString()}`,
    )
  }

  const nonce = Number(rawNonce)
  const version = Number(BigInt(withdrawalLog.args.nonce) >> VERSION_SHIFT)
  return { nonce, version }
}
