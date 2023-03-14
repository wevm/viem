import { Narrow } from 'abitype'
import { PublicClient } from '../../clients'
import { multicall3Abi } from '../../constants'
import {
  AbiDecodingZeroDataError,
  BaseError,
  RawContractError,
} from '../../errors'
import { Address, ContractConfig, Hex, MulticallContracts } from '../../types'
import { MulticallResults } from '../../types/multicall'
import {
  EncodeFunctionDataParameters,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  getChainContractAddress,
} from '../../utils'
import { CallParameters } from './call'
import { readContract } from './readContract'

export type MulticallParameters<
  TContracts extends ContractConfig[] = ContractConfig[],
  TAllowFailure extends boolean = true,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> & {
  allowFailure?: TAllowFailure
  contracts: Narrow<readonly [...MulticallContracts<TContracts>]>
  multicallAddress?: Address
}

export type MulticallReturnType<
  TContracts extends ContractConfig[] = ContractConfig[],
  TAllowFailure extends boolean = true,
> = MulticallResults<TContracts, TAllowFailure>

export async function multicall<
  TContracts extends ContractConfig[],
  TAllowFailure extends boolean = true,
>(
  client: PublicClient,
  args: MulticallParameters<TContracts, TAllowFailure>,
): Promise<MulticallReturnType<TContracts, TAllowFailure>> {
  const {
    allowFailure = true,
    blockNumber,
    blockTag,
    contracts,
    multicallAddress: multicallAddress_,
  } = args

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

  const calls = contracts.map(({ abi, address, args, functionName }) => {
    try {
      const callData = encodeFunctionData({
        abi,
        args,
        functionName,
      } as unknown as EncodeFunctionDataParameters)
      return {
        allowFailure: true,
        callData,
        target: address,
      }
    } catch (err) {
      const error = getContractError(err as BaseError, {
        abi,
        address,
        args,
        docsPath: '/docs/contract/multicall',
        functionName,
      })
      if (!allowFailure) throw error
      return {
        allowFailure: true,
        callData: '0x' as Hex,
        target: address,
      }
    }
  })
  const results = await readContract(client, {
    abi: multicall3Abi,
    address: multicallAddress,
    args: [calls],
    blockNumber,
    blockTag,
    functionName: 'aggregate3',
  })
  return results.map(({ returnData, success }, i) => {
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
