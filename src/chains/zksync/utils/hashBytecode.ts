import { pad } from '../../../utils/data/pad.js'
import { toBytes } from '../../../utils/encoding/toBytes.js'
import { sha256 } from '../../../utils/hash/sha256.js'
import { maxBytecodeLenBytes } from '../constants/number.js'

export function hashBytecode(bytecode: string): Uint8Array {
  // For getting the consistent length we first convert the bytecode to UInt8Array
  const bytecodeAsArray = toBytes(bytecode)

  if (bytecodeAsArray.length % 32 !== 0) {
    throw new Error('The bytecode length in bytes must be divisible by 32')
  }

  if (bytecodeAsArray.length > maxBytecodeLenBytes) {
    throw new Error(
      `Bytecode can not be longer than ${maxBytecodeLenBytes} bytes`,
    )
  }

  const hashStr = sha256(bytecodeAsArray)
  const hash = toBytes(hashStr)

  // Note that the length of the bytecode
  // should be provided in 32-byte words.
  const bytecodeLengthInWords = bytecodeAsArray.length / 32
  if (bytecodeLengthInWords % 2 === 0) {
    throw new Error('Bytecode length in 32-byte words must be odd')
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
