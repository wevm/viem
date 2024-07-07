import type { Address } from 'abitype'
import type { Hex } from '../types/misc.js'
import { BaseError } from './base.js'

export type InitCodeFailedErrorType = InitCodeFailedError & {
  name: 'InitCodeFailedError'
}
export class InitCodeFailedError extends BaseError {
  static entryPointMessage = /aa13/
  override name = 'InitCodeFailedError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super('Failed to simulate deployment for Smart Account.', {
      cause,
      metaMessages: [
        factory && `factory: ${factory}`,
        factoryData && `factoryData: ${factoryData}`,
        initCode && `initCode: ${initCode}`,
      ].filter(Boolean) as string[],
    })
  }
}

export type InitCodeMustReturnSenderErrorType =
  InitCodeMustReturnSenderError & {
    name: 'InitCodeMustReturnSenderError'
  }
export class InitCodeMustReturnSenderError extends BaseError {
  static entryPointMessage = /aa14/
  override name = 'InitCodeMustReturnSenderError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
    sender,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
    sender?: Address | undefined
  }) {
    super('Smart Account initialization does not return the expected sender.', {
      cause,
      metaMessages: [
        factory && `factory: ${factory}`,
        factoryData && `factoryData: ${factoryData}`,
        initCode && `initCode: ${initCode}`,
        sender && `sender: ${sender}`,
      ].filter(Boolean) as string[],
    })
  }
}

export type SenderAlreadyConstructedErrorType =
  SenderAlreadyConstructedError & {
    name: 'SenderAlreadyConstructedError'
  }
export class SenderAlreadyConstructedError extends BaseError {
  static entryPointMessage = /aa10/
  override name = 'SenderAlreadyConstructedError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super('Smart Account has already been deployed.', {
      cause,
      metaMessages: [
        'Remove the following properties and try again:',
        factory && '`factory`',
        factoryData && '`factoryData`',
        initCode && '`initCode`',
      ].filter(Boolean) as string[],
    })
  }
}

export type UnknownEntryPointErrorType = UnknownEntryPointError & {
  name: 'UnknownEntryPointError'
}
export class UnknownEntryPointError extends BaseError {
  override name = 'UnknownEntryPointError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      `An error occurred while executing user operation: ${cause?.shortMessage}`,
      {
        cause,
      },
    )
  }
}
