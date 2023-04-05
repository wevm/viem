import type { Abi } from 'abitype'
import type { BaseError } from '../../errors/index.js'
import {
  AbiDecodingZeroDataError,
  ContractFunctionExecutionError,
  EstimateGasExecutionError,
  RawContractError,
} from '../../errors/index.js'
import {
  CallExecutionError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../errors/contract.js'
import type { Address } from '../../types/index.js'

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
    err instanceof RawContractError
      ? err
      : err instanceof CallExecutionError ||
        err instanceof EstimateGasExecutionError
      ? ((err.cause as BaseError)?.cause as BaseError)?.cause || {}
      : err.cause || {}
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
