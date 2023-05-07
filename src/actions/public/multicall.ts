import type { Address, Narrow } from 'abitype'

import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { multicall3Abi } from '../../constants/abis.js'
import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import type { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'
import type { Chain } from '../../types/chain.js'
import type { ContractFunctionConfig } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type {
  MulticallContracts,
  MulticallResults,
} from '../../types/multicall.js'
import { decodeFunctionResult } from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import { getChainContractAddress } from '../../utils/chain.js'
import { getContractError } from '../../utils/errors/getContractError.js'

import type { CallParameters } from './call.js'
import { readContract } from './readContract.js'

export type MulticallParameters<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> & {
  allowFailure?: TAllowFailure
  /** The maximum size (in bytes) for each calldata chunk. Set to `0` to disable the size limit. @default 1_024 */
  batchSize?: number
  contracts: Narrow<readonly [...MulticallContracts<TContracts>]>
  multicallAddress?: Address
}

export type MulticallReturnType<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true,
> = MulticallResults<TContracts, TAllowFailure>

/**
 * Similar to [`readContract`](https://viem.sh/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
 *
 * - Docs: https://viem.sh/docs/contract/multicall.html
 *
 * @param client - Client to use
 * @param parameters - {@link MulticallParameters}
 * @returns An array of results with accompanying status. {@link MulticallReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { multicall } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const abi = parseAbi([
 *   'function balanceOf(address) view returns (uint256)',
 *   'function totalSupply() view returns (uint256)',
 * ])
 * const results = await multicall(client, {
 *   contracts: [
 *     {
 *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *       abi,
 *       functionName: 'balanceOf',
 *       args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 *     },
 *     {
 *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *       abi,
 *       functionName: 'totalSupply',
 *     },
 *   ],
 * })
 * // [{ result: 424122n, status: 'success' }, { result: 1000000n, status: 'success' }]
 */
export async function multicall<
  TChain extends Chain | undefined,
  TContracts extends ContractFunctionConfig[],
  TAllowFailure extends boolean = true,
>(
  client: PublicClient<Transport, TChain>,
  args: MulticallParameters<TContracts, TAllowFailure>,
): Promise<MulticallReturnType<TContracts, TAllowFailure>> {
  const {
    allowFailure = true,
    batchSize: batchSize_,
    blockNumber,
    blockTag,
    contracts: contracts_,
    multicallAddress: multicallAddress_,
  } = args

  const batchSize =
    batchSize_ ??
    ((typeof client.batch?.multicall === 'object' &&
      client.batch.multicall.batchSize) ||
      1_024)

  // Fix type cast from `Narrow` in type definition.
  const contracts = contracts_ as readonly [...MulticallContracts<TContracts>]

  let multicallAddress = multicallAddress_
  if (!multicallAddress) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. multicallAddress is required.',
      )

    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'multicall3',
    })
  }

  type Aggregate3Calls = {
    allowFailure: boolean
    callData: Hex
    target: Address
  }[]

  const chunkedCalls: Aggregate3Calls[] = [[]]
  let currentChunk = 0
  let currentChunkSize = 0
  for (let i = 0; i < contracts.length; i++) {
    const { abi, address, args, functionName } = contracts[i]
    try {
      const callData = encodeFunctionData({
        abi,
        args,
        functionName,
      } as unknown as EncodeFunctionDataParameters)

      currentChunkSize += callData.length
      if (batchSize > 0 && currentChunkSize > batchSize) {
        currentChunk++
        currentChunkSize = (callData.length - 2) / 2
        chunkedCalls[currentChunk] = []
      }

      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address,
        },
      ]
    } catch (err) {
      const error = getContractError(err as BaseError, {
        abi,
        address,
        args,
        docsPath: '/docs/contract/multicall',
        functionName,
      })
      if (!allowFailure) throw error
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: '0x' as Hex,
          target: address,
        },
      ]
    }
  }

  const results = await Promise.all(
    chunkedCalls.map((calls) =>
      readContract(client, {
        abi: multicall3Abi,
        address: multicallAddress!,
        args: [calls],
        blockNumber,
        blockTag,
        functionName: 'aggregate3',
      }),
    ),
  )

  return results.flat().map(({ returnData, success }, i) => {
    const calls = chunkedCalls.flat()
    const { callData } = calls[i]
    const { abi, address, functionName, args } = contracts[i]
    try {
      if (callData === '0x') throw new AbiDecodingZeroDataError()
      if (!success) throw new RawContractError({ data: returnData })
      const result = decodeFunctionResult({
        abi,
        data: returnData,
        functionName: functionName,
      })
      return allowFailure ? { result, status: 'success' } : result
    } catch (err) {
      const error = getContractError(err as BaseError, {
        abi,
        address,
        args,
        docsPath: '/docs/contract/multicall',
        functionName,
      })
      if (!allowFailure) throw error
      return { error, result: undefined, status: 'failure' }
    }
  }) as MulticallResults<TContracts, TAllowFailure>
}
