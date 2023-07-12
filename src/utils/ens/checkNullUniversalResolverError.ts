import { panicReasons } from '../../constants/solidity.js'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from '../../errors/contract.js'

/*
 * @description Checks if error is a valid null result UniversalResolver error
 */
export function checkNullUniversalResolverError(
  err: unknown,
  callType: 'resolve' | 'reverse',
): boolean {
  if (err instanceof ContractFunctionExecutionError) {
    const cause = err.cause as ContractFunctionRevertedError
    if (
      cause.data?.errorName === 'ResolverNotFound' ||
      cause.data?.errorName === 'ResolverWildcardNotSupported' ||
      // backwards compatibility
      cause.reason?.includes(
        'Wildcard on non-extended resolvers is not supported',
      ) ||
      (callType === 'reverse' &&
        // No primary name set for address.
        cause.reason === panicReasons[50])
    )
      return true
  }
  return false
}
