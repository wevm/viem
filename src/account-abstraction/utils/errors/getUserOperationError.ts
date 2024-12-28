import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../../errors/contract.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { ContractFunctionParameters } from '../../../types/contract.js'
import type { Hex } from '../../../types/misc.js'
import type { OneOf } from '../../../types/utils.js'
import { decodeErrorResult } from '../../../utils/abi/decodeErrorResult.js'
import type { GetContractErrorReturnType } from '../../../utils/errors/getContractError.js'
import { ExecutionRevertedError } from '../../errors/bundler.js'
import {
  UserOperationExecutionError,
  type UserOperationExecutionErrorType,
} from '../../errors/userOperation.js'
import type {
  UserOperation,
  UserOperationCall,
} from '../../types/userOperation.js'
import {
  type GetBundlerErrorParameters,
  getBundlerError,
} from './getBundlerError.js'

type Call = OneOf<
  | UserOperationCall
  | (ContractFunctionParameters & {
      to: Address
    })
>

type GetNodeErrorReturnType = ErrorType

export type GetUserOperationErrorParameters = UserOperation & {
  calls?: readonly unknown[] | undefined
  docsPath?: string | undefined
}

export type GetUserOperationErrorReturnType<cause = ErrorType> = Omit<
  UserOperationExecutionErrorType,
  'cause'
> & { cause: cause | GetNodeErrorReturnType }

export type GetUserOperationErrorErrorType = ErrorType

export function getUserOperationError<err extends ErrorType<string>>(
  err: err,
  { calls, docsPath, ...args }: GetUserOperationErrorParameters,
): GetUserOperationErrorReturnType<err> {
  const cause = (() => {
    const cause = getBundlerError(
      err as {} as BaseError,
      args as GetBundlerErrorParameters,
    )
    if (calls && cause instanceof ExecutionRevertedError) {
      const revertData = getRevertData(cause)
      const contractCalls = calls?.filter(
        (call: any) => call.abi,
      ) as readonly Call[]
      if (revertData && contractCalls.length > 0)
        return getContractError({ calls: contractCalls, revertData })
    }
    return cause
  })()
  return new UserOperationExecutionError(cause, {
    docsPath,
    ...args,
  }) as GetUserOperationErrorReturnType<err>
}

/////////////////////////////////////////////////////////////////////////////////

function getRevertData(error: BaseError) {
  let revertData: Hex | undefined
  error.walk((e) => {
    const error = e as any
    if (
      typeof error.data === 'string' ||
      typeof error.data?.revertData === 'string' ||
      (!(error instanceof BaseError) && typeof error.message === 'string')
    ) {
      const match = (
        error.data?.revertData ||
        error.data ||
        error.message
      ).match?.(/(0x[A-Za-z0-9]*)/)
      if (match) {
        revertData = match[1]
        return true
      }
    }
    return false
  })
  return revertData
}

function getContractError(parameters: {
  calls: readonly Call[]
  revertData: Hex
}) {
  const { calls, revertData } = parameters

  const { abi, functionName, args, to } = (() => {
    const contractCalls = calls?.filter((call) =>
      Boolean(call.abi),
    ) as readonly (ContractFunctionParameters & { to: Address })[]

    if (contractCalls.length === 1) return contractCalls[0]

    const compatContractCalls = contractCalls.filter((call) => {
      try {
        return Boolean(
          decodeErrorResult({
            abi: call.abi,
            data: revertData,
          }),
        )
      } catch {
        return false
      }
    })
    if (compatContractCalls.length === 1) return compatContractCalls[0]

    return {
      abi: [],
      functionName: contractCalls.reduce(
        (acc, call) => `${acc ? `${acc} | ` : ''}${call.functionName}`,
        '',
      ),
      args: undefined,
      to: undefined,
    }
  })()

  const cause = (() => {
    if (revertData === '0x')
      return new ContractFunctionZeroDataError({ functionName })
    return new ContractFunctionRevertedError({
      abi,
      data: revertData,
      functionName,
    })
  })()
  return new ContractFunctionExecutionError(cause as BaseError, {
    abi,
    args,
    contractAddress: to,
    functionName,
  }) as GetContractErrorReturnType
}
