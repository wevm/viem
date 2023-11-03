import type { Address, Narrow } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { deploylessMulticall3Abi, multicall3Abi } from '../../constants/abis.js'
import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'
import type { Chain } from '../../types/chain.js'
import type { ContractFunctionConfig } from '../../types/contract.js'
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
  type EncodeFunctionDataParameters,
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

import {
  decodeAbiParameters,
  encodeDeployData,
  getAbiItem,
} from '~viem/index.js'
import type { ErrorType } from '../../errors/utils.js'
import { getAction } from '../../utils/getAction.js'
import { type CallParameters, call } from './call.js'
import { type ReadContractErrorType, readContract } from './readContract.js'

export type MulticallParameters<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> & {
  allowFailure?: TAllowFailure
  /** The maximum size (in bytes) for each calldata chunk. Set to `0` to disable the size limit. @default 1_024 */
  batchSize?: number
  contracts: Narrow<readonly [...MulticallContracts<TContracts>]>
  multicallAddress?: Address
  deployless?: boolean
}

export type MulticallReturnType<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true,
> = MulticallResults<TContracts, TAllowFailure>

export type MulticallErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | GetContractErrorReturnType<
      EncodeFunctionDataErrorType | DecodeFunctionResultErrorType
    >
  | ErrorType

type Aggregate3Calls = {
  allowFailure: boolean
  callData: Hex
  target: Address
}[]

/**
 * Similar to [`readContract`](https://viem.sh/docs/contract/readContract.html), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
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
  TContracts extends ContractFunctionConfig[],
  TChain extends Chain | undefined,
  TAllowFailure extends boolean = true,
>(
  client: Client<Transport, TChain>,
  args: MulticallParameters<TContracts, TAllowFailure>,
): Promise<MulticallReturnType<TContracts, TAllowFailure>> {
  const {
    allowFailure = true,
    batchSize: batchSize_,
    blockNumber,
    blockTag,
    contracts,
    deployless,
    multicallAddress,
  } = args

  const batchSize =
    batchSize_ ??
    ((typeof client.batch?.multicall === 'object' &&
      client.batch.multicall.batchSize) ||
      1_024)

  const chunkedCalls: Aggregate3Calls[] = [[]]
  let currentChunk = 0
  let currentChunkSize = 0
  for (let i = 0; i < contracts.length; i++) {
    const { abi, address, args, functionName } = contracts[
      i
    ] as ContractFunctionConfig
    try {
      const callData = encodeFunctionData({
        abi,
        args,
        functionName,
      } as unknown as EncodeFunctionDataParameters)

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

  const aggregate3Results = await fetchRawMulticallResults({
    calls: chunkedCalls,
    client,
    multicallAddress,
    blockNumber,
    blockTag,
    deployless,
  })

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
      ] as ContractFunctionConfig

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
  return results as MulticallResults<TContracts, TAllowFailure>
}

// https://github.com/Destiner/ethcall/blob/e7719a388d3f83dd482cc186f03161c6beca8fbc/src/multicall.ts#L372
const deploylessMulticall3Bytecode =
  '0x608060405234801561001057600080fd5b5060405161089338038061089383398181016040528101906100329190610697565b6000815167ffffffffffffffff81111561004f5761004e61033d565b5b60405190808252806020026020018201604052801561008857816020015b6100756102f7565b81526020019060019003908161006d5790505b50905060005b82518110156101f0576000808483815181106100ad576100ac6106e0565b5b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff168584815181106100e2576100e16106e0565b5b6020026020010151604001516040516100fb9190610756565b6000604051808303816000865af19150503d8060008114610138576040519150601f19603f3d011682016040523d82523d6000602084013e61013d565b606091505b5091509150848381518110610155576101546106e0565b5b6020026020010151602001516101a657816101a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161019c906107f0565b60405180910390fd5b5b60405180604001604052808315158152602001828152508484815181106101d0576101cf6106e0565b5b6020026020010181905250505080806101e890610849565b91505061008e565b50602081516040028260405103030160408160405103036001835111156102705760005b835181101561026e578060200260208501018160200260400183018261023c57855160200281525b6000831115610261576020808303510151602083510151038060208303510180835250505b5050600181019050610214565b505b60005b835181101561029e578060200260208501018051516040602083510151035250600181019050610273565b5060005b83518110156102cb578060200260208501016040602080835101510352506001810190506102a2565b506001835114156102e85760208301604082018451602002815250505b60208152825160208201528181f35b6040518060400160405280600015158152602001606081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103758261032c565b810181811067ffffffffffffffff821117156103945761039361033d565b5b80604052505050565b60006103a7610313565b90506103b3828261036c565b919050565b600067ffffffffffffffff8211156103d3576103d261033d565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061041e826103f3565b9050919050565b61042e81610413565b811461043957600080fd5b50565b60008151905061044b81610425565b92915050565b60008115159050919050565b61046681610451565b811461047157600080fd5b50565b6000815190506104838161045d565b92915050565b600080fd5b600067ffffffffffffffff8211156104a9576104a861033d565b5b6104b28261032c565b9050602081019050919050565b60005b838110156104dd5780820151818401526020810190506104c2565b838111156104ec576000848401525b50505050565b60006105056105008461048e565b61039d565b90508281526020810184848401111561052157610520610489565b5b61052c8482856104bf565b509392505050565b600082601f83011261054957610548610327565b5b81516105598482602086016104f2565b91505092915050565b600060608284031215610578576105776103e9565b5b610582606061039d565b905060006105928482850161043c565b60008301525060206105a684828501610474565b602083015250604082015167ffffffffffffffff8111156105ca576105c96103ee565b5b6105d684828501610534565b60408301525092915050565b60006105f56105f0846103b8565b61039d565b90508083825260208201905060208402830185811115610618576106176103e4565b5b835b8181101561065f57805167ffffffffffffffff81111561063d5761063c610327565b5b80860161064a8982610562565b8552602085019450505060208101905061061a565b5050509392505050565b600082601f83011261067e5761067d610327565b5b815161068e8482602086016105e2565b91505092915050565b6000602082840312156106ad576106ac61031d565b5b600082015167ffffffffffffffff8111156106cb576106ca610322565b5b6106d784828501610669565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600081519050919050565b600081905092915050565b60006107308261070f565b61073a818561071a565b935061074a8185602086016104bf565b80840191505092915050565b60006107628284610725565b915081905092915050565b600082825260208201905092915050565b7f4d756c746963616c6c33206167677265676174653a2063616c6c206661696c6560008201527f6400000000000000000000000000000000000000000000000000000000000000602082015250565b60006107da60218361076d565b91506107e58261077e565b604082019050919050565b60006020820190508181036000830152610809816107cd565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000819050919050565b60006108548261083f565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561088757610886610810565b5b60018201905091905056fe'

async function fetchRawMulticallResults<
  TContracts extends ContractFunctionConfig[],
  TChain extends Chain | undefined,
  TAllowFailure extends boolean = true,
>({
  calls: chunkedCalls,
  client,
  multicallAddress: multicallAddress_,
  blockNumber,
  blockTag,
  deployless,
}: Omit<MulticallParameters<TContracts, TAllowFailure>, 'contracts'> & {
  calls: Aggregate3Calls[]
  client: Client<Transport, TChain>
}) {
  let chainMulticallAddress: `0x${string}` | undefined
  if (!multicallAddress_) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. multicallAddress is required.',
      )

    chainMulticallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'multicall3',
      allowMissing: deployless,
    })
  }

  const multicallAddress = multicallAddress_ || chainMulticallAddress

  if (multicallAddress && !deployless) {
    return await Promise.allSettled(
      chunkedCalls.map((calls) =>
        getAction(
          client,
          readContract,
        )({
          abi: multicall3Abi,
          address: multicallAddress,
          args: [calls],
          blockNumber,
          blockTag,
          functionName: 'aggregate3',
        }),
      ),
    )
  }

  return await Promise.allSettled(
    chunkedCalls.map(async (calls) => {
      const data = encodeDeployData({
        abi: deploylessMulticall3Abi,
        args: [calls],
        bytecode: deploylessMulticall3Bytecode,
      })

      const params = blockTag
        ? { data, blockTag }
        : { data, blockNumber, blockTag }

      const callReturn = await getAction(client, call)(params)

      const outputItem = getAbiItem({ abi: multicall3Abi, name: 'aggregate3' })

      if (callReturn.data) {
        const values = decodeAbiParameters(outputItem.outputs, callReturn.data)
        return values[0] as any
      }
    }),
  )
}
