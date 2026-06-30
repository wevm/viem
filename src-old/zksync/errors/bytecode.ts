import { BaseError } from '../../errors/base.js'

export type BytecodeLengthExceedsMaxSizeErrorType =
  BytecodeLengthExceedsMaxSizeError & {
    name: 'BytecodeLengthExceedsMaxSizeError'
  }

export class BytecodeLengthExceedsMaxSizeError extends BaseError {
  constructor({
    givenLength,
    maxBytecodeSize,
  }: { givenLength: number; maxBytecodeSize: bigint }) {
    super(
      `Bytecode cannot be longer than ${maxBytecodeSize} bytes. Given length: ${givenLength}`,
      { name: 'BytecodeLengthExceedsMaxSizeError' },
    )
  }
}

export type BytecodeLengthInWordsMustBeOddErrorType =
  BytecodeLengthInWordsMustBeOddError & {
    name: 'BytecodeLengthInWordsMustBeOddError'
  }

export class BytecodeLengthInWordsMustBeOddError extends BaseError {
  constructor({ givenLengthInWords }: { givenLengthInWords: number }) {
    super(
      `Bytecode length in 32-byte words must be odd. Given length in words: ${givenLengthInWords}`,
      { name: 'BytecodeLengthInWordsMustBeOddError' },
    )
  }
}

export type BytecodeLengthMustBeDivisibleBy32ErrorType =
  BytecodeLengthMustBeDivisibleBy32Error & {
    name: 'BytecodeLengthMustBeDivisibleBy32Error'
  }

export class BytecodeLengthMustBeDivisibleBy32Error extends BaseError {
  constructor({ givenLength }: { givenLength: number }) {
    super(
      `The bytecode length in bytes must be divisible by 32. Given length: ${givenLength}`,
      { name: 'BytecodeLengthMustBeDivisibleBy32Error' },
    )
  }
}
