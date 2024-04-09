import type { Hex } from '../../types/misc.js'
import { pad } from '../../utils/data/pad.js'
import { toBytes } from '../../utils/encoding/toBytes.js'
import { sha256 } from '../../utils/hash/sha256.js'
import { maxBytecodeSize } from '../constants/number.js'
import {
  BytecodeLengthExceedsMaxSizeError,
  BytecodeLengthInWordsMustBeOddError,
  BytecodeLengthMustBeDivisibleBy32Error,
} from '../errors/bytecode.js'

export function hashBytecode(bytecode: Hex): Uint8Array {
  const bytecodeBytes = toBytes(bytecode)
  if (bytecodeBytes.length % 32 !== 0)
    throw new BytecodeLengthMustBeDivisibleBy32Error({
      givenLength: bytecodeBytes.length,
    })

  if (bytecodeBytes.length > maxBytecodeSize)
    throw new BytecodeLengthExceedsMaxSizeError({
      givenLength: bytecodeBytes.length,
      maxBytecodeSize,
    })

  const hashStr = sha256(bytecodeBytes)
  const hash = toBytes(hashStr)

  // Note that the length of the bytecode
  // should be provided in 32-byte words.
  const bytecodeLengthInWords = bytecodeBytes.length / 32
  if (bytecodeLengthInWords % 2 === 0) {
    throw new BytecodeLengthInWordsMustBeOddError({
      givenLengthInWords: bytecodeLengthInWords,
    })
  }

  const bytecodeLength = toBytes(bytecodeLengthInWords)

  // The bytecode should always take the first 2 bytes of the bytecode hash,
  // so we pad it from the left in case the length is smaller than 2 bytes.
  const bytecodeLengthPadded = pad(bytecodeLength, { size: 2 })

  const codeHashVersion = new Uint8Array([1, 0])
  hash.set(codeHashVersion, 0)
  hash.set(bytecodeLengthPadded, 2)

  return hash
}
