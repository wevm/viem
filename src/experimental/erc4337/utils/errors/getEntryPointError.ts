import type { BaseError } from '../../../../errors/base.js'
import type { ExactPartial } from '../../../../types/utils.js'
import {
  InitCodeFailedError,
  type InitCodeFailedErrorType,
  InitCodeMustReturnSenderError,
  type InitCodeMustReturnSenderErrorType,
  SenderAlreadyConstructedError,
  type SenderAlreadyConstructedErrorType,
  UnknownEntryPointError,
  type UnknownEntryPointErrorType,
} from '../../errors/entryPoint.js'
import type { UserOperation } from '../../types/userOperation.js'

export type GetEntryPointErrorParameters = ExactPartial<UserOperation>

export type GetEntryPointErrorReturnType =
  | InitCodeFailedErrorType
  | InitCodeMustReturnSenderErrorType
  | SenderAlreadyConstructedErrorType
  | UnknownEntryPointErrorType

export function getEntryPointError(
  err: BaseError,
  args: GetEntryPointErrorParameters,
): GetEntryPointErrorReturnType {
  const message = (err.details || '').toLowerCase()

  if (InitCodeFailedError.entryPointMessage.test(message))
    return new InitCodeFailedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    }) as any
  if (InitCodeMustReturnSenderError.entryPointMessage.test(message))
    return new InitCodeMustReturnSenderError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
      sender: args.sender,
    }) as any
  if (SenderAlreadyConstructedError.entryPointMessage.test(message))
    return new SenderAlreadyConstructedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    }) as any
  return new UnknownEntryPointError({
    cause: err,
  }) as any
}
