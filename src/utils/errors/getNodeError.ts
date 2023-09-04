import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import { BaseError } from '../../errors/base.js'
import {
  ExecutionRevertedError,
  FeeCapTooHighError,
  FeeCapTooLowError,
  InsufficientFundsError,
  IntrinsicGasTooHighError,
  IntrinsicGasTooLowError,
  NonceMaxValueError,
  NonceTooHighError,
  NonceTooLowError,
  TipAboveFeeCapError,
  TransactionTypeNotSupportedError,
  UnknownNodeError,
} from '../../errors/node.js'
import { RpcRequestError } from '../../errors/request.js'
import {
  InvalidInputRpcError,
  TransactionRejectedRpcError,
} from '../../errors/rpc.js'

export function containsNodeError(err: BaseError) {
  return (
    err instanceof TransactionRejectedRpcError ||
    err instanceof InvalidInputRpcError ||
    (err instanceof RpcRequestError && err.code === ExecutionRevertedError.code)
  )
}

export type GetNodeErrorParameters = Partial<SendTransactionParameters<any>>

export function getNodeError(err: BaseError, args: GetNodeErrorParameters) {
  const message = (err.details || '').toLowerCase()

  const executionRevertedError = err.walk(
    (e) => (e as { code: number }).code === ExecutionRevertedError.code,
  )
  if (executionRevertedError instanceof BaseError) {
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details,
    })
  } else if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details,
    })
  else if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce })
  else if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce })
  else if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce })
  else if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err })
  else if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas })
  else if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas })
  else if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err })
  else if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas,
    })
  return new UnknownNodeError({
    cause: err,
  })
}
