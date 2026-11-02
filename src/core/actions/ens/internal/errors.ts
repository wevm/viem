import { BaseError } from '../../../Errors.js'
import * as ContractError from '../../../ContractError.js'

const nullResolverErrors = [
  'HttpError',
  'ResolverError',
  'ResolverNotContract',
  'ResolverNotFound',
  'ReverseAddressMismatch',
  'UnsupportedResolverProfile',
]

/**
 * Whether an error is a UniversalResolver revert that maps to a `null`
 * resolution result (unresolvable name) rather than a hard failure.
 */
export function isNullUniversalResolverError(err: unknown): boolean {
  if (!(err instanceof BaseError)) return false
  const cause = err.walk(
    (e) => e instanceof ContractError.ContractFunctionRevertedError,
  )
  if (!(cause instanceof ContractError.ContractFunctionRevertedError))
    return false
  return nullResolverErrors.includes(cause.data?.name ?? '')
}
