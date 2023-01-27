import { BaseError } from './base'

export class AbiDecodingDataSizeInvalidError extends BaseError {
  name = 'AbiDecodingDataSizeInvalidError'
  constructor(size: number) {
    super(
      [
        `Data size of ${size} bytes is invalid.`,
        'Size must be in increments of 32 bytes (size % 32 === 0).',
      ].join('\n'),
    )
  }
}

export class AbiEncodingArrayLengthMismatchError extends BaseError {
  name = 'AbiEncodingArrayLengthMismatchError'
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

export class AbiEncodingLengthMismatchError extends BaseError {
  name = 'AbiEncodingLengthMismatchError'
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

export class AbiFunctionNotFoundError extends BaseError {
  name = 'AbiFunctionNotFoundError'
  constructor(functionName: string) {
    super(
      [
        `Function "${functionName}" not found on ABI.`,
        'Make sure you are using the correct ABI and that the function exists on it.',
      ].join('\n'),
      {
        docsPath: '/docs/contract/encodeFunctionParams',
      },
    )
  }
}

export class InvalidAbiEncodingTypeError extends BaseError {
  name = 'InvalidAbiEncodingType'
  constructor(type: string) {
    super(
      [
        `Type "${type}" is not a valid encoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath: '/docs/contract/encodeAbi#params' },
    )
  }
}

export class InvalidAbiDecodingTypeError extends BaseError {
  name = 'InvalidAbiDecodingType'
  constructor(type: string) {
    super(
      [
        `Type "${type}" is not a valid decoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath: '/docs/contract/decodeAbi#params' },
    )
  }
}

export class InvalidArrayError extends BaseError {
  name = 'InvalidArrayError'
  constructor(value: unknown) {
    super([`Value "${value}" is not a valid array.`].join('\n'))
  }
}

export class InvalidDefinitionTypeError extends BaseError {
  name = 'InvalidDefinitionTypeError'
  constructor(type: string) {
    super(
      [
        `"${type}" is not a valid definition type.`,
        'Valid types: "function", "event", "error"',
      ].join('\n'),
      {
        docsPath: '/docs/contract/getDefinition',
      },
    )
  }
}
