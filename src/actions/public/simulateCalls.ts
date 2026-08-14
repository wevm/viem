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
import { CallExecutionError } from '../../errors/contract.js'
import { ExecutionRevertedError } from '../../errors/node.js'
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
import { type PadErrorType, pad } from '../../utils/data/pad.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { type CallErrorType, call } from './call.js'
import { type GetBlockErrorType, getBlock } from './getBlock.js'
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

// Runtime bytecode from `contracts/src/deployless/StaticCall.sol`, compiled with
// Solidity 0.8.35.
const staticCallCode =
  '0x608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063fd00430c1461002d575b5f5ffd5b6100476004803603810190610042919061012b565b610049565b005b80825f375f5f825f865afa610060573d5f5f3e3d5ffd5b3d5f5f3e3d5ff35b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009982610070565b9050919050565b6100a98161008f565b81146100b3575f5ffd5b50565b5f813590506100c4816100a0565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f8401126100eb576100ea6100ca565b5b8235905067ffffffffffffffff811115610108576101076100ce565b5b602083019150836001820283011115610124576101236100d2565b5b9250929050565b5f5f5f6040848603121561014257610141610068565b5b5f61014f868287016100b6565b935050602084013567ffffffffffffffff8111156101705761016f61006c565b5b61017c868287016100d6565b9250925050925092509256fea2646970667358221220635ed99185cacf3f2acba6921f23687c969cec2bbaf5f9ad599f507e6e105e6964736f6c63430008230033'

const staticCallAddressBase = 0x00000000000000000000000000000000deadbeefn

// ERC20 & ERC721 share this selector – both are `Transfer(address,address,uint256)`.
const transferEventSelector = AbiEvent.getSelector(
  AbiEvent.from(
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ),
)

const balanceOfFunction = AbiFunction.from(
  'function balanceOf(address) returns (uint256)',
)
const decimalsFunction = AbiFunction.from(
  'function decimals() returns (uint256)',
)
const tokenUriFunction = AbiFunction.from(
  'function tokenURI(uint256) returns (string)',
)
const symbolFunction = AbiFunction.from('function symbol() returns (string)')
const staticCallFunction = AbiFunction.from(
  'function query(address target, bytes data)',
)
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
  | CallErrorType
  | GetBlockErrorType
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

  // Resolve moving canonical tags once so both simulations share a block. Preserve
  // `pending` because its prospective number cannot be queried directly.
  // Do not infer the base from results because clients disagree on simulated numbering.
  const blockTag_ = blockTag ?? client.experimental_blockTag ?? 'latest'
  let baseBlockNumber = blockNumber
  if (
    traceAssetChanges &&
    typeof baseBlockNumber !== 'bigint' &&
    blockTag_ !== 'earliest' &&
    blockTag_ !== 'pending'
  ) {
    if (blockTag_ === 'latest')
      baseBlockNumber = await getBlockNumber(client, { cacheTime: 0 })
    else {
      const block = await getBlock(client, { blockTag: blockTag_ })
      if (typeof block.number !== 'bigint')
        throw new BaseError(
          `Block tag \`${blockTag_}\` did not resolve to a number.`,
        )
      baseBlockNumber = block.number
    }
  }
  const block_ =
    typeof baseBlockNumber === 'bigint'
      ? { blockNumber: baseBlockNumber }
      : { blockTag: blockTag_ }

  // Discover ERC20/721 addresses the calls move assets in. Simulating the batch as a
  // whole is what makes this correct: the calls run sequentially, with the caller's
  // state overrides, on the same base block the results are measured against.
  const discovery = traceAssetChanges
    ? await simulateBlocks(client, {
        ...block_,
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
      })
    : undefined

  const assetAddresses = discovery
    ? [
        ...new Set([
          ...tokensFromLogs(
            discovery[0]!.calls.flatMap((call) => call.logs ?? []),
            account!.address,
          ),
          // Included even for calls without data: contracts that mint on receiving
          // native value (WETH) emit `Deposit`, not a `Transfer` the logs would catch.
          // Candidates without code fall out at `isBalance`.
          ...parameters.calls.map((call: any) => call.to?.toLowerCase()),
        ]),
      ].filter(
        (address): address is Address =>
          Boolean(address) && address !== ethAddress && address !== zeroAddress,
      )
    : []
  const staticCallAddress = getStaticCallAddress([
    ...(account ? [account.address] : []),
    ...assetAddresses,
    ...(stateOverrides?.map(({ address }) => address) ?? []),
  ])
  const staticCallStateOverrides: StateOverride = [
    { address: staticCallAddress, code: staticCallCode },
  ]

  const [balanceCallsPre, blocks] = await Promise.all([
    traceAssetChanges
      ? Promise.all([
          readBalance(client, {
            account: account!.address,
            ...block_,
            data: getBalanceData!,
            stateOverride: stateOverrides,
          }),
          ...assetAddresses.map((address) =>
            readBalance(client, {
              account: account!.address,
              address,
              ...block_,
              data: AbiFunction.encodeData(balanceOfFunction, [
                account!.address,
              ]),
              staticCallAddress,
              stateOverride: stateOverrides,
            }),
          ),
        ])
      : [],
    simulateBlocks(client, {
      ...block_,
      blocks: [
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
                calls: assetAddresses.map((address) => ({
                  to: staticCallAddress,
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(balanceOfFunction, [
                      account!.address,
                    ]),
                  ),
                })),
                stateOverrides: staticCallStateOverrides,
              },

              // Decimals
              {
                calls: assetAddresses.map((address) => ({
                  to: staticCallAddress,
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(decimalsFunction),
                  ),
                })),
                stateOverrides: staticCallStateOverrides,
              },

              // Token URI
              {
                calls: assetAddresses.map((address) => ({
                  to: staticCallAddress,
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(tokenUriFunction, [0n]),
                  ),
                })),
                stateOverrides: staticCallStateOverrides,
              },

              // Symbols
              {
                calls: assetAddresses.map((address) => ({
                  to: staticCallAddress,
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(symbolFunction),
                  ),
                })),
                stateOverrides: staticCallStateOverrides,
              },
            ]
          : []),
      ],
      traceTransfers,
      validation,
    }),
  ])

  const block_results = blocks[0]!
  const [
    block_ethPost,
    block_assetsPost,
    block_decimals,
    block_tokenURI,
    block_symbols,
  ] = traceAssetChanges ? blocks.slice(1) : []

  // Extract call results from the simulation.
  const { calls: block_calls, ...block } = block_results
  const results = block_calls.slice(0, -1)

  // Extract pre-execution ETH and asset balances.
  const balancesPre = balanceCallsPre.map((call) =>
    isBalance(call) ? hexToBigInt(call.data) : null,
  )

  // Extract post-execution ETH and asset balances.
  const ethPost = block_ethPost?.calls ?? []
  const assetsPost = block_assetsPost?.calls ?? []
  const balanceCallsPost = [...ethPost, ...assetsPost]
  const balancesPost = balanceCallsPost.map((call) =>
    isBalance(call) ? hexToBigInt(call.data) : null,
  )

  // Extract asset symbols & decimals.
  const decimals = (block_decimals?.calls ?? []).map((call) =>
    decodeAssetResult(call, decimalsFunction),
  ) as (bigint | null)[]
  const symbols = (block_symbols?.calls ?? []).map((call) =>
    decodeAssetResult(call, symbolFunction),
  ) as (string | null)[]
  const tokenURI = (block_tokenURI?.calls ?? []).map((call) =>
    decodeAssetResult(call, tokenUriFunction),
  ) as (string | null)[]

  const changes: Mutable<SimulateCallsReturnType<calls>['assetChanges']> = []
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre_ = balancesPre[i]
    const preCall = balanceCallsPre[i]
    const balancePre =
      typeof balancePre_ === 'bigint'
        ? balancePre_
        : i > 0 && preCall?.status === 'success' && preCall.data === '0x'
          ? 0n
          : null

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

function encodeStaticCall(address: Address, data: Hex) {
  return AbiFunction.encodeData(staticCallFunction, [address, data])
}

// Extract token addresses that the account transferred, from a simulated block's logs.
// Only topics 0-2 are read: ERC721's fourth topic is the token id, which is irrelevant
// as `balanceOf(address)` on a 721 returns the owner's NFT count.
function tokensFromLogs(logs: readonly Log[], account: Address): Address[] {
  const account_ = pad(account.toLowerCase() as Hex, { size: 32 })
  return logs
    .filter((log) => {
      if (log.topics[0]?.toLowerCase() !== transferEventSelector) return false
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
  return call.status === 'success' && /^0x[\da-f]{64}$/i.test(call.data)
}

function decodeAssetResult(
  call: { data: Hex; status: 'success' | 'failure' },
  abiFunction: AbiFunction.AbiFunction,
) {
  if (call.status === 'failure' || call.data === '0x') return null
  try {
    return AbiFunction.decodeResult(abiFunction, call.data)
  } catch {
    return null
  }
}

async function readBalance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: {
    account: Address
    address?: Address | undefined
    blockNumber?: bigint | undefined
    blockTag?: BlockTag | undefined
    data: Hex
    staticCallAddress?: Address | undefined
    stateOverride: StateOverride | undefined
  },
) {
  const {
    account,
    address,
    blockNumber,
    blockTag,
    data,
    staticCallAddress,
    stateOverride,
  } = parameters
  try {
    const result = await call({ ...client, ccipRead: false }, {
      account: address ? zeroAddress : account,
      data: address ? encodeStaticCall(address, data) : data,
      stateOverride:
        address && staticCallAddress
          ? [
              ...(stateOverride ?? []),
              { address: staticCallAddress, code: staticCallCode },
            ]
          : stateOverride,
      ...(address ? { to: staticCallAddress } : {}),
      ...(typeof blockNumber === 'bigint' ? { blockNumber } : { blockTag }),
    } as never)
    return { data: result.data ?? '0x', status: 'success' as const }
  } catch (error) {
    if (
      !(error instanceof CallExecutionError) ||
      !(error.cause instanceof ExecutionRevertedError)
    )
      throw error
    return { data: '0x' as const, status: 'failure' as const }
  }
}

function getStaticCallAddress(addresses: readonly Address[]): Address {
  const occupied = new Set(addresses.map((address) => address.toLowerCase()))
  let value = staticCallAddressBase
  while (occupied.has(`0x${value.toString(16).padStart(40, '0')}`)) value++
  return `0x${value.toString(16).padStart(40, '0')}`
}
