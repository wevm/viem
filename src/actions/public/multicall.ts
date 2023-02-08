import { PublicClient } from '../../clients'
import { multicall3Abi } from '../../constants'
import { BaseError, RawContractError } from '../../errors'
import { Address, ContractConfig, Hex, MulticallContracts } from '../../types'
import { MulticallResults } from '../../types/multicall'
import {
  decodeFunctionResult,
  encodeFunctionData,
  EncodeFunctionDataArgs,
  getContractError,
} from '../../utils'
import { CallArgs } from './call'
import { readContract } from './readContract'

export type MulticallArgs<
  TContracts extends ContractConfig[],
  TAllowFailure extends boolean = true,
> = Pick<CallArgs, 'blockNumber' | 'blockTag'> & {
  allowFailure?: TAllowFailure
  contracts: readonly [...MulticallContracts<TContracts>]
  multicallAddress: Address
}

export async function multicall<
  TContracts extends ContractConfig[],
  TAllowFailure extends boolean = true,
>(
  client: PublicClient,
  args: MulticallArgs<TContracts, TAllowFailure>,
): Promise<MulticallResults<TContracts, TAllowFailure>> {
  const { allowFailure = true, contracts, multicallAddress } = args

  const calls = contracts.map(({ abi, address, args, functionName }) => {
    try {
      const callData = encodeFunctionData({
        abi,
        args,
        functionName,
      } as unknown as EncodeFunctionDataArgs)
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
    functionName: 'aggregate3',
  })
  return results.map(({ returnData, success }, i) => {
    const { abi, address, functionName, args } = contracts[i]
    try {
      if (!success) throw new RawContractError({ data: returnData })
      const result = decodeFunctionResult({
        abi,
        data: returnData,
        functionName: functionName,
      })
      return { result, status: 'success' }
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
