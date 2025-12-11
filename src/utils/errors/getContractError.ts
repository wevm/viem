import type { Abi, Address } from 'abitype'

import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import { BaseError } from '../../errors/base.js'
import {
  ContractFunctionExecutionError,
  type ContractFunctionExecutionErrorType,
  ContractFunctionRevertedError,
  type ContractFunctionRevertedErrorType,
  ContractFunctionZeroDataError,
  type ContractFunctionZeroDataErrorType,
  RawContractError,
} from '../../errors/contract.js'
import { RpcRequestError } from '../../errors/request.js'
import { InternalRpcError, InvalidInputRpcError } from '../../errors/rpc.js'
import type { ErrorType } from '../../errors/utils.js'

const EXECUTION_REVERTED_ERROR_CODE = 3

export type GetContractErrorReturnType<cause = ErrorType> = Omit<
  ContractFunctionExecutionErrorType,
  'cause'
> & {
  cause:
    | cause
    | ContractFunctionZeroDataErrorType
    | ContractFunctionRevertedErrorType
}

export function getContractError<err extends ErrorType<string>>(
  err: err,
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
    address?: Address | undefined
    docsPath?: string | undefined
    functionName: string
    sender?: Address | undefined
  },
): GetContractErrorReturnType {
  const error = (
    err instanceof RawContractError
      ? err
      : err instanceof BaseError
        ? err.walk((err) => 'data' in (err as Error)) || err.walk()
        : {}
  ) as BaseError
  const { code, data, details, message, shortMessage } =
    error as RawContractError

  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName })
    if (
      ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) &&
        (data || details || message || shortMessage)) ||
      (code === InvalidInputRpcError.code &&
        details === 'execution reverted' &&
        data)
    ) {
      return new ContractFunctionRevertedError({
        abi,
        data: typeof data === 'object' ? data.data : data,
        functionName,
        message:
          error instanceof RpcRequestError
            ? details
            : (shortMessage ?? message),
      })
    }
    return err
  })()

  return new ContractFunctionExecutionError(cause as BaseError, {
    abi,
    args,
    contractAddress: address,
    docsPath,
    functionName,
    sender,
  }) as GetContractErrorReturnType
}
