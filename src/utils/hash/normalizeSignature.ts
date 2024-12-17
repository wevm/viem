import type {
  AbiEvent,
  AbiFunction,
  ParseAbiItem,
  SignatureAbiItem,
} from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'

/**
 * TODO: ParseAbiItem<Signature> is too strict here since
 *       1. normalizeSignature allows loose formatting (ex: spacing)
 *       2. normalization doesn't require the string to conform to abitype's human-readable encoding
 *       ex: 'function  bar( )' should still results in `bar()` as the result
 *       ex: `event foo(tuple(uint16, uint16))` results in a broken type response
 *       for now, we return`string` in cases where abitype fails
 *                but this doesn't handle error cases where abitype is just wrong like
 * TODO: Some obvious errors get the return type `string`
 *       this is because we fallback to `string` if `ParseAbiItem<Signature>` fails
 *       but it could fail because not because it's too strict, but because the string is plain incorrect
 *       ex: normalizeSignature('bar') falls back to `string` as the response type
 *           since it can't tell if this is wrong since `ParseAbiItem<Signature>` is too strict or if it really is invalid
 * TODO: Some normalizations are missing
 *       ex 1: (JS wrong, type correct) 'event Barry(uint foo)' results in type `Barry(uint256)`, but the real return value is `Barry(uint)`.
 *       ex 2: (Both wrong) tuples doesn't get removed `foo(tuple(uint16, uint16))` does not get normalized to 'foo((uint16, uint16))'
 */
export type ToSignature<Signature extends string> =
  ParseAbiItem<Signature> extends never
    ? string
    : ParseAbiItem<Signature> extends AbiFunction | AbiEvent
      ? SignatureAbiItem<ParseAbiItem<Signature>>
      : never

type NormalizeSignatureParameters<Signature extends string> = Signature
type NormalizeSignatureReturnType<Signature extends string> =
  ToSignature<Signature>
export type NormalizeSignatureErrorType = ErrorType

export function normalizeSignature<Signature extends string>(
  signature: NormalizeSignatureParameters<Signature>,
): NormalizeSignatureReturnType<Signature> {
  let active = true
  let current = ''
  let level = 0
  let result = ''
  let valid = false

  for (let i = 0; i < signature.length; i++) {
    const char = signature[i]

    // If the character is a separator, we want to reactivate.
    if (['(', ')', ','].includes(char)) active = true

    // If the character is a "level" token, we want to increment/decrement.
    if (char === '(') level++
    if (char === ')') level--

    // If we aren't active, we don't want to mutate the result.
    if (!active) continue

    // If level === 0, we are at the definition level.
    if (level === 0) {
      if (char === ' ' && ['event', 'function', ''].includes(result))
        result = ''
      else {
        result += char

        // If we are at the end of the definition, we must be finished.
        if (char === ')') {
          valid = true
          break
        }
      }

      continue
    }

    // Ignore spaces
    if (char === ' ') {
      // If the previous character is a separator, and the current section isn't empty, we want to deactivate.
      if (signature[i - 1] !== ',' && current !== ',' && current !== ',(') {
        current = ''
        active = false
      }
      continue
    }

    result += char
    current += char
  }

  if (!valid) throw new BaseError('Unable to normalize signature.')

  return result as NormalizeSignatureReturnType<Signature>
}
