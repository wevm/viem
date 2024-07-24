import type { ErrorType } from '../../../errors/utils.js'
import type { ExactPartial } from '../../../types/utils.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import type { RpcUserOperation } from '../../types/rpc.js'
import type { UserOperation } from '../../types/userOperation.js'

export type FormatUserOperationRequestErrorType = ErrorType

export function formatUserOperationRequest(
  request: ExactPartial<UserOperation>,
) {
  const rpcRequest = {} as RpcUserOperation

  if (typeof request.callData !== 'undefined')
    rpcRequest.callData = request.callData
  if (typeof request.callGasLimit !== 'undefined')
    rpcRequest.callGasLimit = numberToHex(request.callGasLimit)
  if (typeof request.factory !== 'undefined')
    rpcRequest.factory = request.factory
  if (typeof request.factoryData !== 'undefined')
    rpcRequest.factoryData = request.factoryData
  if (typeof request.initCode !== 'undefined')
    rpcRequest.initCode = request.initCode
  if (typeof request.maxFeePerGas !== 'undefined')
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas)
  if (typeof request.maxPriorityFeePerGas !== 'undefined')
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas)
  if (typeof request.nonce !== 'undefined')
    rpcRequest.nonce = numberToHex(request.nonce)
  if (typeof request.paymaster !== 'undefined')
    rpcRequest.paymaster = request.paymaster
  if (typeof request.paymasterAndData !== 'undefined')
    rpcRequest.paymasterAndData = request.paymasterAndData || '0x'
  if (typeof request.paymasterData !== 'undefined')
    rpcRequest.paymasterData = request.paymasterData
  if (typeof request.paymasterPostOpGasLimit !== 'undefined')
    rpcRequest.paymasterPostOpGasLimit = numberToHex(
      request.paymasterPostOpGasLimit,
    )
  if (typeof request.paymasterVerificationGasLimit !== 'undefined')
    rpcRequest.paymasterVerificationGasLimit = numberToHex(
      request.paymasterVerificationGasLimit,
    )
  if (typeof request.preVerificationGas !== 'undefined')
    rpcRequest.preVerificationGas = numberToHex(request.preVerificationGas)
  if (typeof request.sender !== 'undefined') rpcRequest.sender = request.sender
  if (typeof request.signature !== 'undefined')
    rpcRequest.signature = request.signature
  if (typeof request.verificationGasLimit !== 'undefined')
    rpcRequest.verificationGasLimit = numberToHex(request.verificationGasLimit)

  return rpcRequest
}
