import type { ErrorType } from '../../errors/utils.js'
import type { Hex, Signature } from '../../types/misc.js'
import { fromCompactHex } from './internal/compact.js'

export type ParseSignatureErrorType = ErrorType

/**
 * @description Parses a hex formatted signature into a structured signature.
 *
 * @param signatureHex Signature in hex format.
 * @returns The structured signature.
 *
 * @example
 * parseSignature('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c')
 * // { r: '0x...', s: '0x...', v: 28n }
 */
export function parseSignature(signatureHex: Hex) {
  const { r, s } = fromCompactHex(signatureHex.slice(2, 130))
  const yParityOrV = Number(`0x${signatureHex.slice(130)}`)
  const [v, yParity] = (() => {
    if (yParityOrV === 0 || yParityOrV === 1) return [undefined, yParityOrV]
    if (yParityOrV === 27) return [BigInt(yParityOrV), 0]
    if (yParityOrV === 28) return [BigInt(yParityOrV), 1]
    throw new Error('Invalid yParityOrV value')
  })()

  if (typeof v !== 'undefined')
    return {
      r,
      s,
      v,
      yParity,
    } satisfies Signature
  return {
    r,
    s,
    yParity,
  } satisfies Signature
}
