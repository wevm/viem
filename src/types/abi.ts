import type { Abi, IsAbi } from 'abitype'
import type { IsNever } from './utils'

/**
 * @description Checks if {@link TAbi} is inferrable
 * @param TAbi - Type to check
 * @example
 * import { seaportAbi } from 'abitype/test'
 * type Result = IsInferrableAbi<typeof seaportAbi>
 * //   ^? true
 */
export type IsInferrableAbi<TAbi extends Abi | readonly unknown[]> = IsNever<
  IsAbi<TAbi> & (Abi extends TAbi ? false : true)
> extends true
  ? false
  : true
