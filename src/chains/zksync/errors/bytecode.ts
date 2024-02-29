import { BaseError } from '../../../errors/base.js'

export type BytecodeLengthExceedsMaxErrorType =
  BytecodeLengthExceedsMaxError & {
    name: 'BytecodeLengthExceedsMaxError'
  }

export class BytecodeLengthExceedsMaxError extends BaseError {
  override name = 'BytecodeLengthExceedsMaxError'
  constructor({
    givenLength,
    maxBytecodeLenBytes,
  }: { givenLength: number; maxBytecodeLenBytes: bigint }) {
    super(
      `Bytecode cannot be longer than ${maxBytecodeLenBytes} bytes. Given length: ${givenLength}`,
    )
  }
}

export type BytecodeLengthInWordsMustBeOddErrorType =
  BytecodeLengthInWordsMustBeOddError & {
    name: 'BytecodeLengthInWordsMustBeOddError'
  }

export class BytecodeLengthInWordsMustBeOddError extends BaseError {
  override name = 'BytecodeLengthInWordsMustBeOddError'
  constructor({ givenLengthInWords }: { givenLengthInWords: number }) {
    super(
      `Bytecode length in 32-byte words must be odd. Given length in words: ${givenLengthInWords}`,
    )
  }
}

export type BytecodeLengthMustBeDivisibleBy32ErrorType =
  BytecodeLengthMustBeDivisibleBy32Error & {
    name: 'BytecodeLengthMustBeDivisibleBy32Error'
  }

export class BytecodeLengthMustBeDivisibleBy32Error extends BaseError {
  override name = 'BytecodeLengthMustBeDivisibleBy32Error'
  constructor({ givenLength }: { givenLength: number }) {
    super(
      `The bytecode length in bytes must be divisible by 32. Given length: ${givenLength}`,
    )
  }
}
