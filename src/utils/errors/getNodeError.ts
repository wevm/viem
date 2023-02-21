import { SendTransactionArgs } from '../../actions'
import {
  BaseError,
  ExecutionRevertedError,
  FeeCapTooHighError,
  FeeCapTooLowError,
  InsufficientFundsError,
  IntrinsicGasTooHighError,
  IntrinsicGasTooLowError,
  InvalidInputRpcError,
  NonceMaxValueError,
  NonceTooHighError,
  NonceTooLowError,
  RpcError,
  TipAboveFeeCapError,
  TransactionRejectedRpcError,
  TransactionTypeNotSupportedError,
  UnknownNodeError,
} from '../../errors'

export function containsNodeError(err: BaseError) {
  return (
    err instanceof TransactionRejectedRpcError ||
    err instanceof InvalidInputRpcError ||
    (err instanceof RpcError && err.code === ExecutionRevertedError.code)
  )
}

export function getNodeError(
  err: BaseError,
  args: SendTransactionArgs<any> = {},
) {
  const message = err.details.toLowerCase()
  if (message.match(FeeCapTooHighError.nodeMessage))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (message.match(FeeCapTooLowError.nodeMessage))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (message.match(NonceTooHighError.nodeMessage))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce })
  else if (message.match(NonceTooLowError.nodeMessage))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce })
  else if (message.match(NonceMaxValueError.nodeMessage))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce })
  else if (message.match(InsufficientFundsError.nodeMessage))
    return new InsufficientFundsError({ cause: err })
  else if (message.match(IntrinsicGasTooHighError.nodeMessage))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas })
  else if (message.match(IntrinsicGasTooLowError.nodeMessage))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas })
  else if (message.match(TransactionTypeNotSupportedError.nodeMessage))
    return new TransactionTypeNotSupportedError({ cause: err })
  else if (message.match(TipAboveFeeCapError.nodeMessage))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas,
    })
  else if (
    message.match(ExecutionRevertedError.nodeMessage) ||
    ('code' in (err.cause as BaseError) &&
      (err.cause as { code: number })?.code === ExecutionRevertedError.code)
  )
    return new ExecutionRevertedError({
      cause: err,
      message: (err.cause as BaseError).details,
    })
  return new UnknownNodeError({
    cause: (err.cause as BaseError).cause as BaseError,
  })
}
