import type { AbiStateMutability, Address, Narrow } from 'abitype'
import * as AbiConstructor from 'ox/AbiConstructor'
import * as AbiFunction from 'ox/AbiFunction'

import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { ethAddress, zeroAddress } from '../../constants/address.js'
import { deploylessCallViaBytecodeBytecode } from '../../constants/contracts.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Block } from '../../types/block.js'
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
import { hexToBigInt } from '../../utils/index.js'
import {
  type CreateAccessListErrorType,
  createAccessList,
} from './createAccessList.js'
import {
  type SimulateBlocksErrorType,
  type SimulateBlocksParameters,
  simulateBlocks,
} from './simulateBlocks.js'

const getBalanceCode =
  '0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033'

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
  | CreateAccessListErrorType
  | EncodeFunctionDataErrorType
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

  // Fetch ERC20/721 addresses that were "touched" from the calls.
  const assetAddresses = traceAssetChanges
    ? await Promise.all(
        parameters.calls.map(async (call: any) => {
          if (!call.data && !call.abi) return
          const { accessList } = await createAccessList(client, {
            account: account!.address,
            ...call,
            data: call.abi ? encodeFunctionData(call) : call.data,
          })
          return accessList.map(({ address, storageKeys }) =>
            storageKeys.length > 0 ? address : null,
          )
        }),
      ).then((x) => x.flat().filter(Boolean))
    : []

  const resultsStateOverrides = stateOverrides?.map((override) => {
    if (override.address === account?.address)
      return {
        ...override,
        nonce: 0,
      }
    return override
  })

  const blocks = await simulateBlocks(client, {
    blockNumber,
    blockTag: blockTag as undefined,
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
        calls: [...calls, {}].map((call, index) => ({
          ...(call as Call),
          from: account?.address,
          nonce: index,
        })) as any,
        stateOverrides: resultsStateOverrides,
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
    call.status === 'success' ? hexToBigInt(call.data) : null,
  )

  // Extract post-execution ETH and asset balances.
  const ethPost = block_ethPost?.calls ?? []
  const assetsPost = block_assetsPost?.calls ?? []
  const balancesPost = [...ethPost, ...assetsPost].map((call) =>
    call.status === 'success' ? hexToBigInt(call.data) : null,
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
