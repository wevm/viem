import type { AbiStateMutability, Address, Narrow } from 'abitype'
import * as AbiConstructor from 'ox/AbiConstructor'
import * as AbiEvent from 'ox/AbiEvent'
import * as AbiFunction from 'ox/AbiFunction'

import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { ethAddress, zeroAddress } from '../../constants/address.js'
import { deploylessCallViaBytecodeBytecode } from '../../constants/contracts.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Block, BlockTag } from '../../types/block.js'
import type { Call, Calls } from '../../types/calls.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { MulticallResults } from '../../types/multicall.js'
import type { StateOverride } from '../../types/stateOverride.js'
import type { Mutable } from '../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import { type PadErrorType, pad } from '../../utils/data/pad.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { createAccessList } from './createAccessList.js'
import {
  type GetBlockNumberErrorType,
  getBlockNumber,
} from './getBlockNumber.js'
import {
  type SimulateBlocksErrorType,
  type SimulateBlocksParameters,
  simulateBlocks,
} from './simulateBlocks.js'

const getBalanceCode =
  '0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033'

// ERC20 & ERC721 share this selector – both are `Transfer(address,address,uint256)`.
const transferEventSelector = AbiEvent.getSelector(
  AbiEvent.from(
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ),
)

// Extract token addresses that the account transferred, from a simulated block's logs.
// Only topics 0-2 are read: ERC721's fourth topic is the token id, which is irrelevant
// as `balanceOf(address)` on a 721 returns the owner's NFT count.
function tokensFromLogs(logs: readonly Log[], account: Address): Address[] {
  const account_ = pad(account.toLowerCase() as Hex, { size: 32 })
  return logs
    .filter((log) => {
      if (log.topics[0] !== transferEventSelector) return false
      // `traceTransfers` emits synthetic native transfer logs under `ethAddress`, which
      // is measured separately.
      if (log.address.toLowerCase() === ethAddress) return false
      return (
        log.topics[1]?.toLowerCase() === account_ ||
        log.topics[2]?.toLowerCase() === account_
      )
    })
    .map((log) => log.address.toLowerCase() as Address)
}

// Whether a `balanceOf` probe returned a balance. A candidate without code (an EOA that
// merely received value) succeeds with empty data instead of reverting, so `status`
// alone is not enough.
function isBalance(call: { data: Hex; status: 'success' | 'failure' }) {
  return call.status === 'success' && call.data !== '0x'
}

// Supplementary discovery for assets whose balance changes without a `Transfer` the
// account participates in. Advisory only: no state overrides are passed – geth accepts
// them on `eth_createAccessList`, but support is not portable across nodes – so it runs
// against unmodified state and rejects calls that revert there, and some nodes do not
// implement the method at all. Log-based discovery covers those cases.
async function accessListHints<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: {
    account: Address
    blockNumber: bigint | undefined
    blockTag: BlockTag | undefined
    call: any
  },
): Promise<Address[]> {
  const { account, blockNumber, blockTag, call } = parameters
  if (!call.data && !call.abi) return []
  try {
    const { accessList } = await createAccessList(client, {
      account,
      ...call,
      data: call.abi ? encodeFunctionData(call) : call.data,
      ...(typeof blockNumber === 'bigint' ? { blockNumber } : { blockTag }),
    })
    return accessList
      .filter(({ storageKeys }) => storageKeys.length > 0)
      .map(({ address }) => address.toLowerCase() as Address)
  } catch {
    return []
  }
}

export type SimulateCallsParameters<
  calls extends readonly unknown[] = readonly unknown[],
  account extends Account | Address | undefined = Account | Address | undefined,
> = Omit<SimulateBlocksParameters, 'blocks' | 'returnFullTransactions'> & {
  /** Account attached to the calls (msg.sender). */
  account?: account | undefined
  /** Calls to simulate. */
  calls: Calls<Narrow<calls>>
  /** State overrides. */
  stateOverrides?: StateOverride | undefined
  /** Whether to trace asset changes. */
  traceAssetChanges?: boolean | undefined
}

export type SimulateCallsReturnType<
  calls extends readonly unknown[] = readonly unknown[],
> = {
  /** Asset changes. */
  assetChanges: readonly {
    token: {
      address: Address
      decimals?: number | undefined
      symbol?: string | undefined
    }
    value: { pre: bigint; post: bigint; diff: bigint }
  }[]
  /** Block results. */
  block: Block
  /** Call results. */
  results: MulticallResults<
    Narrow<calls>,
    true,
    {
      extraProperties: {
        data: Hex
        gasUsed: bigint
        logs?: Log[] | undefined
      }
      error: Error
      mutability: AbiStateMutability
    }
  >
}

export type SimulateCallsErrorType =
  | AbiFunction.encodeData.ErrorType
  | AbiFunction.from.ErrorType
  | EncodeFunctionDataErrorType
  | GetBlockNumberErrorType
  | PadErrorType
  | SimulateBlocksErrorType
  | ErrorType

/**
 * Simulates execution of a batch of calls.
 *
 * @param client - Client to use
 * @param parameters - {@link SimulateCallsParameters}
 * @returns Results. {@link SimulateCallsReturnType}
 *
 * @example
 * ```ts
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateCalls } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const result = await simulateCalls(client, {
 *   account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *   calls: [{
 *     {
 *       data: '0xdeadbeef',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     },
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: parseEther('1'),
 *     },
 *   ]
 * })
 * ```
 */
export async function simulateCalls<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: SimulateCallsParameters<calls, account>,
): Promise<SimulateCallsReturnType<calls>> {
  const {
    blockNumber,
    blockTag,
    calls,
    stateOverrides,
    traceAssetChanges,
    traceTransfers,
    validation,
  } = parameters

  const account = parameters.account
    ? parseAccount(parameters.account)
    : undefined

  if (traceAssetChanges && !account)
    throw new BaseError(
      '`account` is required when `traceAssetChanges` is true',
    )

  // Derive bytecode to extract ETH balance via a contract call.
  const getBalanceData = account
    ? AbiConstructor.encode(AbiConstructor.from('constructor(bytes, bytes)'), {
        bytecode: deploylessCallViaBytecodeBytecode,
        args: [
          getBalanceCode,
          AbiFunction.encodeData(
            AbiFunction.from('function getBalance(address)'),
            [account.address],
          ),
        ],
      })
    : undefined

  // Discovery and measurement are separate requests, and `latest` resolves per request –
  // independently, and possibly on a different replica – so without pinning, the token
  // set can be computed against one block and the balances against another. Resolved
  // upfront rather than derived from the discovery response: `eth_simulateV1`'s returned
  // block numbering is not portable. The spec and geth put the first simulated block at
  // base + 1, but anvil put it at base until foundry-rs/foundry#15841 (unreleased as of
  // 1.7.1), so `number - 1n` silently picks the wrong base on some nodes. Only `latest`
  // is pinned; an explicit tag is left as the caller wrote it.
  const blockTag_ = blockTag ?? client.experimental_blockTag ?? 'latest'
  const baseBlockNumber =
    traceAssetChanges &&
    typeof blockNumber !== 'bigint' &&
    blockTag_ === 'latest'
      ? await getBlockNumber(client, { cacheTime: 0 })
      : blockNumber

  // Discover ERC20/721 addresses the calls move assets in. Simulating the batch as a
  // whole is what makes this correct: the calls run sequentially, with the caller's
  // state overrides, on the same base block the results are measured against. The access
  // list pass is supplementary and runs concurrently, so it costs no additional latency.
  const discovery = traceAssetChanges
    ? await Promise.all([
        simulateBlocks(client, {
          blockNumber: baseBlockNumber,
          blockTag: (typeof baseBlockNumber === 'bigint'
            ? undefined
            : blockTag_) as undefined,
          blocks: [
            {
              calls: calls.map((call) => ({
                ...(call as Call),
                from: account!.address,
              })) as any,
              stateOverrides,
            },
          ],
          traceTransfers,
          validation,
        }),
        Promise.all(
          parameters.calls.map((call: any) =>
            accessListHints(client, {
              account: account!.address,
              blockNumber: baseBlockNumber,
              blockTag:
                typeof baseBlockNumber === 'bigint' ? undefined : blockTag_,
              call,
            }),
          ),
        ),
      ])
    : undefined

  const assetAddresses = discovery
    ? [
        ...new Set([
          ...tokensFromLogs(
            discovery[0][0]!.calls.flatMap((call) => call.logs ?? []),
            account!.address,
          ),
          // Included even for calls without data: contracts that mint on receiving
          // native value (WETH) emit `Deposit`, not a `Transfer` the logs would catch.
          // Candidates without code fall out at `isBalance`.
          ...parameters.calls.map((call: any) => call.to?.toLowerCase()),
          ...discovery[1].flat(),
        ]),
      ].filter(
        (address): address is Address =>
          Boolean(address) && address !== ethAddress && address !== zeroAddress,
      )
    : []

  const blocks = await simulateBlocks(client, {
    blockNumber: baseBlockNumber,
    blockTag: (typeof baseBlockNumber === 'bigint'
      ? undefined
      : blockTag_) as undefined,
    blocks: [
      ...(traceAssetChanges
        ? [
            // ETH pre balances
            {
              calls: [{ data: getBalanceData }],
              stateOverrides,
            },

            // Asset pre balances
            {
              calls: assetAddresses.map((address, i) => ({
                abi: [
                  AbiFunction.from(
                    'function balanceOf(address) returns (uint256)',
                  ),
                ],
                functionName: 'balanceOf',
                args: [account!.address],
                to: address,
                from: zeroAddress,
                nonce: i,
              })),
              stateOverrides: [
                {
                  address: zeroAddress,
                  nonce: 0,
                },
              ],
            },
          ]
        : []),

      {
        calls: [...calls, { to: zeroAddress }].map((call) => ({
          ...(call as Call),
          from: account?.address,
        })) as any,
        stateOverrides,
      },

      ...(traceAssetChanges
        ? [
            // ETH post balances
            {
              calls: [{ data: getBalanceData }],
            },

            // Asset post balances
            {
              calls: assetAddresses.map((address, i) => ({
                abi: [
                  AbiFunction.from(
                    'function balanceOf(address) returns (uint256)',
                  ),
                ],
                functionName: 'balanceOf',
                args: [account!.address],
                to: address,
                from: zeroAddress,
                nonce: i,
              })),
              stateOverrides: [
                {
                  address: zeroAddress,
                  nonce: 0,
                },
              ],
            },

            // Decimals
            {
              calls: assetAddresses.map((address, i) => ({
                to: address,
                abi: [
                  AbiFunction.from('function decimals() returns (uint256)'),
                ],
                functionName: 'decimals',
                from: zeroAddress,
                nonce: i,
              })),
              stateOverrides: [
                {
                  address: zeroAddress,
                  nonce: 0,
                },
              ],
            },

            // Token URI
            {
              calls: assetAddresses.map((address, i) => ({
                to: address,
                abi: [
                  AbiFunction.from(
                    'function tokenURI(uint256) returns (string)',
                  ),
                ],
                functionName: 'tokenURI',
                args: [0n],
                from: zeroAddress,
                nonce: i,
              })),
              stateOverrides: [
                {
                  address: zeroAddress,
                  nonce: 0,
                },
              ],
            },

            // Symbols
            {
              calls: assetAddresses.map((address, i) => ({
                to: address,
                abi: [AbiFunction.from('function symbol() returns (string)')],
                functionName: 'symbol',
                from: zeroAddress,
                nonce: i,
              })),
              stateOverrides: [
                {
                  address: zeroAddress,
                  nonce: 0,
                },
              ],
            },
          ]
        : []),
    ],
    traceTransfers,
    validation,
  })

  const block_results = traceAssetChanges ? blocks[2] : blocks[0]
  const [
    block_ethPre,
    block_assetsPre,
    ,
    block_ethPost,
    block_assetsPost,
    block_decimals,
    block_tokenURI,
    block_symbols,
  ] = traceAssetChanges ? blocks : []

  // Extract call results from the simulation.
  const { calls: block_calls, ...block } = block_results
  const results = block_calls.slice(0, -1) ?? []

  // Extract pre-execution ETH and asset balances.
  const ethPre = block_ethPre?.calls ?? []
  const assetsPre = block_assetsPre?.calls ?? []
  const balancesPre = [...ethPre, ...assetsPre].map((call) =>
    isBalance(call) ? hexToBigInt(call.data) : null,
  )

  // Extract post-execution ETH and asset balances.
  const ethPost = block_ethPost?.calls ?? []
  const assetsPost = block_assetsPost?.calls ?? []
  const balancesPost = [...ethPost, ...assetsPost].map((call) =>
    isBalance(call) ? hexToBigInt(call.data) : null,
  )

  // Extract asset symbols & decimals.
  const decimals = (block_decimals?.calls ?? []).map((x) =>
    x.status === 'success' ? x.result : null,
  ) as (number | null)[]
  const symbols = (block_symbols?.calls ?? []).map((x) =>
    x.status === 'success' ? x.result : null,
  ) as (string | null)[]
  const tokenURI = (block_tokenURI?.calls ?? []).map((x) =>
    x.status === 'success' ? x.result : null,
  ) as (string | null)[]

  const changes: Mutable<SimulateCallsReturnType<calls>['assetChanges']> = []
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre = balancesPre[i]

    if (typeof balancePost !== 'bigint') continue
    if (typeof balancePre !== 'bigint') continue

    const decimals_ = decimals[i - 1]
    const symbol_ = symbols[i - 1]
    const tokenURI_ = tokenURI[i - 1]

    const token = (() => {
      if (i === 0)
        return {
          address: ethAddress,
          decimals: 18,
          symbol: 'ETH',
        }

      return {
        address: assetAddresses[i - 1]! as Address,
        decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : undefined,
        symbol: symbol_ ?? undefined,
      }
    })()

    if (changes.some((change) => change.token.address === token.address))
      continue

    changes.push({
      token,
      value: {
        pre: balancePre,
        post: balancePost,
        diff: balancePost - balancePre,
      },
    })
  }

  return {
    assetChanges: changes,
    block,
    results,
  } as unknown as SimulateCallsReturnType<calls>
}
