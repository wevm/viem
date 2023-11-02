import type { AbiEvent, AbiParameter } from 'abitype'

import type { Hex } from '../types/misc.js'
import { formatAbiItem, formatAbiParams } from '../utils/abi/formatAbiItem.js'
import { size } from '../utils/data/size.js'

import { BaseError } from './base.js'

export type AbiConstructorNotFoundErrorType = AbiConstructorNotFoundError & {
  name: 'AbiConstructorNotFoundError'
}
export class AbiConstructorNotFoundError extends BaseError {
  override name = 'AbiConstructorNotFoundError'
  constructor({ docsPath }: { docsPath: string }) {
    super(
      [
        'A constructor was not found on the ABI.',
        'Make sure you are using the correct ABI and that the constructor exists on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiConstructorParamsNotFoundErrorType =
  AbiConstructorParamsNotFoundError & {
    name: 'AbiConstructorParamsNotFoundError'
  }

export class AbiConstructorParamsNotFoundError extends BaseError {
  override name = 'AbiConstructorParamsNotFoundError'
  constructor({ docsPath }: { docsPath: string }) {
    super(
      [
        'Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.',
        'Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiDecodingDataSizeInvalidErrorType =
  AbiDecodingDataSizeInvalidError & {
    name: 'AbiDecodingDataSizeInvalidError'
  }
export class AbiDecodingDataSizeInvalidError extends BaseError {
  override name = 'AbiDecodingDataSizeInvalidError'
  constructor({ data, size }: { data: Hex; size: number }) {
    super(
      [
        `Data size of ${size} bytes is invalid.`,
        'Size must be in increments of 32 bytes (size % 32 === 0).',
      ].join('\n'),
      { metaMessages: [`Data: ${data} (${size} bytes)`] },
    )
  }
}

export type AbiDecodingDataSizeTooSmallErrorType =
  AbiDecodingDataSizeTooSmallError & {
    name: 'AbiDecodingDataSizeTooSmallError'
  }
export class AbiDecodingDataSizeTooSmallError extends BaseError {
  override name = 'AbiDecodingDataSizeTooSmallError'

  data: Hex
  params: readonly AbiParameter[]
  size: number

  constructor({
    data,
    params,
    size,
  }: { data: Hex; params: readonly AbiParameter[]; size: number }) {
    super(
      [`Data size of ${size} bytes is too small for given parameters.`].join(
        '\n',
      ),
      {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size} bytes)`,
        ],
      },
    )

    this.data = data
    this.params = params
    this.size = size
  }
}

export type AbiDecodingZeroDataErrorType = AbiDecodingZeroDataError & {
  name: 'AbiDecodingZeroDataError'
}
export class AbiDecodingZeroDataError extends BaseError {
  override name = 'AbiDecodingZeroDataError'
  constructor() {
    super('Cannot decode zero data ("0x") with ABI parameters.')
  }
}

export type AbiEncodingArrayLengthMismatchErrorType =
  AbiEncodingArrayLengthMismatchError & {
    name: 'AbiEncodingArrayLengthMismatchError'
  }
export class AbiEncodingArrayLengthMismatchError extends BaseError {
  override name = 'AbiEncodingArrayLengthMismatchError'
  constructor({
    expectedLength,
    givenLength,
    type,
  }: { expectedLength: number; givenLength: number; type: string }) {
    super(
      [
        `ABI encoding array length mismatch for type ${type}.`,
        `Expected length: ${expectedLength}`,
        `Given length: ${givenLength}`,
      ].join('\n'),
    )
  }
}

export type AbiEncodingBytesSizeMismatchErrorType =
  AbiEncodingBytesSizeMismatchError & {
    name: 'AbiEncodingBytesSizeMismatchError'
  }
export class AbiEncodingBytesSizeMismatchError extends BaseError {
  override name = 'AbiEncodingBytesSizeMismatchError'
  constructor({ expectedSize, value }: { expectedSize: number; value: Hex }) {
    super(
      `Size of bytes "${value}" (bytes${size(
        value,
      )}) does not match expected size (bytes${expectedSize}).`,
    )
  }
}

export type AbiEncodingLengthMismatchErrorType =
  AbiEncodingLengthMismatchError & {
    name: 'AbiEncodingLengthMismatchError'
  }
export class AbiEncodingLengthMismatchError extends BaseError {
  override name = 'AbiEncodingLengthMismatchError'
  constructor({
    expectedLength,
    givenLength,
  }: { expectedLength: number; givenLength: number }) {
    super(
      [
        'ABI encoding params/values length mismatch.',
        `Expected length (params): ${expectedLength}`,
        `Given length (values): ${givenLength}`,
      ].join('\n'),
    )
  }
}

export type AbiErrorInputsNotFoundErrorType = AbiErrorInputsNotFoundError & {
  name: 'AbiErrorInputsNotFoundError'
}
export class AbiErrorInputsNotFoundError extends BaseError {
  override name = 'AbiErrorInputsNotFoundError'
  constructor(errorName: string, { docsPath }: { docsPath: string }) {
    super(
      [
        `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
        'Cannot encode error result without knowing what the parameter types are.',
        'Make sure you are using the correct ABI and that the inputs exist on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiErrorNotFoundErrorType = AbiErrorNotFoundError & {
  name: 'AbiErrorNotFoundError'
}
export class AbiErrorNotFoundError extends BaseError {
  override name = 'AbiErrorNotFoundError'
  constructor(errorName?: string, { docsPath }: { docsPath?: string } = {}) {
    super(
      [
        `Error ${errorName ? `"${errorName}" ` : ''}not found on ABI.`,
        'Make sure you are using the correct ABI and that the error exists on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiErrorSignatureNotFoundErrorType =
  AbiErrorSignatureNotFoundError & {
    name: 'AbiErrorSignatureNotFoundError'
  }
export class AbiErrorSignatureNotFoundError extends BaseError {
  override name = 'AbiErrorSignatureNotFoundError'

  signature: Hex

  constructor(signature: Hex, { docsPath }: { docsPath: string }) {
    super(
      [
        `Encoded error signature "${signature}" not found on ABI.`,
        'Make sure you are using the correct ABI and that the error exists on it.',
        `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`,
      ].join('\n'),
      {
        docsPath,
      },
    )
    this.signature = signature
  }
}

export type AbiEventSignatureEmptyTopicsErrorType =
  AbiEventSignatureEmptyTopicsError & {
    name: 'AbiEventSignatureEmptyTopicsError'
  }
export class AbiEventSignatureEmptyTopicsError extends BaseError {
  override name = 'AbiEventSignatureEmptyTopicsError'
  constructor({ docsPath }: { docsPath: string }) {
    super('Cannot extract event signature from empty topics.', {
      docsPath,
    })
  }
}

export type AbiEventSignatureNotFoundErrorType =
  AbiEventSignatureNotFoundError & {
    name: 'AbiEventSignatureNotFoundError'
  }
export class AbiEventSignatureNotFoundError extends BaseError {
  override name = 'AbiEventSignatureNotFoundError'
  constructor(signature: Hex, { docsPath }: { docsPath: string }) {
    super(
      [
        `Encoded event signature "${signature}" not found on ABI.`,
        'Make sure you are using the correct ABI and that the event exists on it.',
        `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`,
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiEventNotFoundErrorType = AbiEventNotFoundError & {
  name: 'AbiEventNotFoundError'
}
export class AbiEventNotFoundError extends BaseError {
  override name = 'AbiEventNotFoundError'
  constructor(eventName?: string, { docsPath }: { docsPath?: string } = {}) {
    super(
      [
        `Event ${eventName ? `"${eventName}" ` : ''}not found on ABI.`,
        'Make sure you are using the correct ABI and that the event exists on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiFunctionNotFoundErrorType = AbiFunctionNotFoundError & {
  name: 'AbiFunctionNotFoundError'
}
export class AbiFunctionNotFoundError extends BaseError {
  override name = 'AbiFunctionNotFoundError'
  constructor(functionName?: string, { docsPath }: { docsPath?: string } = {}) {
    super(
      [
        `Function ${functionName ? `"${functionName}" ` : ''}not found on ABI.`,
        'Make sure you are using the correct ABI and that the function exists on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiFunctionOutputsNotFoundErrorType =
  AbiFunctionOutputsNotFoundError & {
    name: 'AbiFunctionOutputsNotFoundError'
  }
export class AbiFunctionOutputsNotFoundError extends BaseError {
  override name = 'AbiFunctionOutputsNotFoundError'
  constructor(functionName: string, { docsPath }: { docsPath: string }) {
    super(
      [
        `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
        'Cannot decode function result without knowing what the parameter types are.',
        'Make sure you are using the correct ABI and that the function exists on it.',
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type AbiFunctionSignatureNotFoundErrorType =
  AbiFunctionSignatureNotFoundError & {
    name: 'AbiFunctionSignatureNotFoundError'
  }
export class AbiFunctionSignatureNotFoundError extends BaseError {
  override name = 'AbiFunctionSignatureNotFoundError'
  constructor(signature: Hex, { docsPath }: { docsPath: string }) {
    super(
      [
        `Encoded function signature "${signature}" not found on ABI.`,
        'Make sure you are using the correct ABI and that the function exists on it.',
        `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`,
      ].join('\n'),
      {
        docsPath,
      },
    )
  }
}

export type BytesSizeMismatchErrorType = BytesSizeMismatchError & {
  name: 'BytesSizeMismatchError'
}
export class BytesSizeMismatchError extends BaseError {
  override name = 'BytesSizeMismatchError'
  constructor({
    expectedSize,
    givenSize,
  }: { expectedSize: number; givenSize: number }) {
    super(`Expected bytes${expectedSize}, got bytes${givenSize}.`)
  }
}

export type DecodeLogDataMismatchErrorType = DecodeLogDataMismatch & {
  name: 'DecodeLogDataMismatch'
}
export class DecodeLogDataMismatch extends BaseError {
  override name = 'DecodeLogDataMismatch'

  abiItem: AbiEvent
  data: Hex
  params: readonly AbiParameter[]
  size: number

  constructor({
    abiItem,
    data,
    params,
    size,
  }: {
    abiItem: AbiEvent
    data: Hex
    params: readonly AbiParameter[]
    size: number
  }) {
    super(
      [
        `Data size of ${size} bytes is too small for non-indexed event parameters.`,
      ].join('\n'),
      {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size} bytes)`,
        ],
      },
    )

    this.abiItem = abiItem
    this.data = data
    this.params = params
    this.size = size
  }
}

export type DecodeLogTopicsMismatchErrorType = DecodeLogTopicsMismatch & {
  name: 'DecodeLogTopicsMismatch'
}
export class DecodeLogTopicsMismatch extends BaseError {
  override name = 'DecodeLogTopicsMismatch'

  abiItem: AbiEvent

  constructor({
    abiItem,
    param,
  }: {
    abiItem: AbiEvent
    param: AbiParameter & { indexed: boolean }
  }) {
    super(
      [
        `Expected a topic for indexed event parameter${
          param.name ? ` "${param.name}"` : ''
        } on event "${formatAbiItem(abiItem, { includeName: true })}".`,
      ].join('\n'),
    )

    this.abiItem = abiItem
  }
}

export type InvalidAbiEncodingTypeErrorType = InvalidAbiEncodingTypeError & {
  name: 'InvalidAbiEncodingTypeError'
}
export class InvalidAbiEncodingTypeError extends BaseError {
  override name = 'InvalidAbiEncodingType'
  constructor(type: string, { docsPath }: { docsPath: string }) {
    super(
      [
        `Type "${type}" is not a valid encoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath },
    )
  }
}

export type InvalidAbiDecodingTypeErrorType = InvalidAbiDecodingTypeError & {
  name: 'InvalidAbiDecodingTypeError'
}
export class InvalidAbiDecodingTypeError extends BaseError {
  override name = 'InvalidAbiDecodingType'
  constructor(type: string, { docsPath }: { docsPath: string }) {
    super(
      [
        `Type "${type}" is not a valid decoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath },
    )
  }
}

export type InvalidArrayErrorType = InvalidArrayError & {
  name: 'InvalidArrayError'
}
export class InvalidArrayError extends BaseError {
  override name = 'InvalidArrayError'
  constructor(value: unknown) {
    super([`Value "${value}" is not a valid array.`].join('\n'))
  }
}

export type InvalidDefinitionTypeErrorType = InvalidDefinitionTypeError & {
  name: 'InvalidDefinitionTypeError'
}
export class InvalidDefinitionTypeError extends BaseError {
  override name = 'InvalidDefinitionTypeError'
  constructor(type: string) {
    super(
      [
        `"${type}" is not a valid definition type.`,
        'Valid types: "function", "event", "error"',
      ].join('\n'),
    )
  }
}

export type UnsupportedPackedAbiTypeErrorType = UnsupportedPackedAbiType & {
  name: 'UnsupportedPackedAbiType'
}
export class UnsupportedPackedAbiType extends BaseError {
  override name = 'UnsupportedPackedAbiType'
  constructor(type: unknown) {
    super(`Type "${type}" is not supported for packed encoding.`)
  }
}
