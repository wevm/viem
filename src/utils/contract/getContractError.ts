import { Abi } from 'abitype'
import {
  AbiDecodingZeroDataError,
  ContractMethodExecutionError,
  ContractMethodZeroDataError,
} from '../../errors'
import { Address } from '../../types'
import {
  formatAbiItemWithArgs,
  formatAbiItemWithParams,
  getAbiItem,
} from '../abi'

export function getContractError(
  err: unknown,
  {
    abi,
    address,
    args,
    functionName,
    sender,
  }: {
    abi: Abi
    args: any
    address?: Address
    functionName: string
    sender?: Address
  },
) {
  const { code, message } =
    ((err as Error).cause as { code?: number; message?: string }) || {}

  const abiItem = getAbiItem({ abi, name: functionName })
  const formattedArgs = abiItem
    ? formatAbiItemWithArgs({
        abiItem,
        args,
        includeFunctionName: false,
        includeName: false,
      })
    : undefined
  const functionWithParams = abiItem
    ? formatAbiItemWithParams(abiItem, { includeName: true })
    : undefined

  if (err instanceof AbiDecodingZeroDataError) {
    return new ContractMethodZeroDataError({
      abi,
      args,
      cause: err as Error,
      contractAddress: address,
      functionName,
      functionWithParams,
    })
  }
  if (code === 3 || message?.includes('execution reverted')) {
    const message_ = message?.replace('execution reverted: ', '')
    return new ContractMethodExecutionError(message_, {
      abi,
      args,
      cause: err as Error,
      contractAddress: address,
      formattedArgs,
      functionName,
      functionWithParams,
      sender,
    })
  }
  return err
}
