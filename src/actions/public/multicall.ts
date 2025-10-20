import type { AbiStateMutability, Address, Narrow } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { multicall3Abi } from '../../constants/abis.js'
import { multicall3Bytecode } from '../../constants/contracts.js'
import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { ContractFunctionParameters } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type {
  MulticallContracts,
  MulticallResults,
} from '../../types/multicall.js'
import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import {
  type GetChainContractAddressErrorType,
  getChainContractAddress,
} from '../../utils/chain/getChainContractAddress.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../utils/errors/getContractError.js'
import { getAction } from '../../utils/getAction.js'
import type { CallParameters } from './call.js'
import { type ReadContractErrorType, readContract } from './readContract.js'

export type MulticallParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    optional?: boolean
    properties?: Record<string, any>
  } = {},
> = Pick<
  CallParameters,
  | 'authorizationList'
  | 'blockNumber'
  | 'blockOverrides'
  | 'blockTag'
  | 'stateOverride'
> & {
  /** The account to use for the multicall. */
  account?: Address | undefined
  /** Whether to allow failures. */
  allowFailure?: allowFailure | boolean | undefined
  /** The size of each batch of calls. */
  batchSize?: number | undefined
  /** Enable deployless multicall. */
  deployless?: boolean | undefined
  /** The contracts to call. */
  contracts: MulticallContracts<
    Narrow<contracts>,
    { mutability: AbiStateMutability } & options
  >
  /** The address of the multicall3 contract to use. */
  multicallAddress?: Address | undefined
}

export type MulticallReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error
  } = { error: Error },
> = MulticallResults<
  Narrow<contracts>,
  allowFailure,
  { mutability: AbiStateMutability } & options
>

export type MulticallErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | GetContractErrorReturnType<
      EncodeFunctionDataErrorType | DecodeFunctionResultErrorType
    >
  | ErrorType

/**
 * Similar to [`readContract`](https://viem.sh/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
 *
 * - Docs: https://viem.sh/docs/contract/multicall
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
  const contracts extends readonly unknown[],
  chain extends Chain | undefined,
  allowFailure extends boolean = true,
>(
  client: Client<Transport, chain>,
  parameters: MulticallParameters<contracts, allowFailure>,
): Promise<MulticallReturnType<contracts, allowFailure>> {
  const {
    account,
    authorizationList,
    allowFailure = true,
    blockNumber,
    blockOverrides,
    blockTag,
    stateOverride,
  } = parameters
  const contracts = parameters.contracts as ContractFunctionParameters[]

  const {
    batchSize = parameters.batchSize ?? 1024,
    deployless = parameters.deployless ?? false,
  } = typeof client.batch?.multicall === 'object' ? client.batch.multicall : {}

  const multicallAddress = (() => {
    if (parameters.multicallAddress) return parameters.multicallAddress
    if (deployless) return null
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: 'multicall3',
      })
    }
    throw new Error(
      'client chain not configured. multicallAddress is required.',
    )
  })()

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
      const callData = encodeFunctionData({ abi, args, functionName })

      currentChunkSize += (callData.length - 2) / 2
      // Check to see if we need to create a new chunk.
      if (
        // Check if batching is enabled.
        batchSize > 0 &&
        // Check if the current size of the batch exceeds the size limit.
        currentChunkSize > batchSize &&
        // Check if the current chunk is not already empty.
        chunkedCalls[currentChunk].length > 0
      ) {
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
        sender: account,
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

  const aggregate3Results = await Promise.allSettled(
    chunkedCalls.map((calls) =>
      getAction(
        client,
        readContract,
        'readContract',
      )({
        ...(multicallAddress === null
          ? { code: multicall3Bytecode }
          : { address: multicallAddress }),
        abi: multicall3Abi,
        account,
        args: [calls],
        authorizationList,
        blockNumber,
        blockOverrides,
        blockTag,
        functionName: 'aggregate3',
        stateOverride,
      }),
    ),
  )

  const results = []
  for (let i = 0; i < aggregate3Results.length; i++) {
    const result = aggregate3Results[i]

    // If an error occurred in a `readContract` invocation (ie. network error),
    // then append the failure reason to each contract result.
    if (result.status === 'rejected') {
      if (!allowFailure) throw result.reason
      for (let j = 0; j < chunkedCalls[i].length; j++) {
        results.push({
          status: 'failure',
          error: result.reason,
          result: undefined,
        })
      }
      continue
    }

    // If the `readContract` call was successful, then decode the results.
    const aggregate3Result = result.value
    for (let j = 0; j < aggregate3Result.length; j++) {
      // Extract the response from `readContract`
      const { returnData, success } = aggregate3Result[j]

      // Extract the request call data from the original call.
      const { callData } = chunkedCalls[i][j]

      // Extract the contract config for this call from the `contracts` argument
      // for decoding.
      const { abi, address, functionName, args } = contracts[
        results.length
      ] as ContractFunctionParameters

      try {
        if (callData === '0x') throw new AbiDecodingZeroDataError()
        if (!success) throw new RawContractError({ data: returnData })
        const result = decodeFunctionResult({
          abi,
          args,
          data: returnData,
          functionName,
        })
        results.push(allowFailure ? { result, status: 'success' } : result)
      } catch (err) {
        const error = getContractError(err as BaseError, {
          abi,
          address,
          args,
          docsPath: '/docs/contract/multicall',
          functionName,
        })
        if (!allowFailure) throw error
        results.push({ error, result: undefined, status: 'failure' })
      }
    }
  }

  if (results.length !== contracts.length)
    throw new BaseError('multicall results mismatch')
  return results as MulticallReturnType<contracts, allowFailure>
}
