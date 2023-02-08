import { Abi } from 'abitype'
import {
  AbiDecodingZeroDataError,
  BaseError,
  ContractFunctionExecutionError,
  RawContractError,
} from '../../errors'
import {
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../errors/contract'
import { Address } from '../../types'

const EXECUTION_REVERTED_ERROR_CODE = 3

export function getContractError(
  err: BaseError,
  {
    abi,
    address,
    args,
    docsPath,
    functionName,
    sender,
  }: {
    abi: Abi
    args: any
    address?: Address
    docsPath?: string
    functionName: string
    sender?: Address
  },
) {
  const { code, data, message } = (
    err instanceof RawContractError ? err : err.cause || {}
  ) as RawContractError

  let cause = err
  if (err instanceof AbiDecodingZeroDataError) {
    cause = new ContractFunctionZeroDataError({ functionName })
  } else if (code === EXECUTION_REVERTED_ERROR_CODE && (data || message)) {
    cause = new ContractFunctionRevertedError({
      abi,
      data,
      functionName,
      message,
    })
  }

  return new ContractFunctionExecutionError(cause, {
    abi,
    args,
    contractAddress: address,
    docsPath,
    functionName,
    sender,
  })
}
