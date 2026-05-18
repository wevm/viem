import { concat } from '../../../utils/data/concat.js'
import type { UserOperation } from '../../types/userOperation.js'

export type GetInitCodeOptions = {
  /** Prepare the init code for hashing. */
  forHash?: boolean | undefined
}

export function getInitCode(
  userOperation: Pick<
    UserOperation,
    'authorization' | 'factory' | 'factoryData'
  >,
  options: GetInitCodeOptions = {},
) {
  const { forHash } = options
  const { authorization, factory, factoryData } = userOperation
  if (
    forHash &&
    (factory === '0x7702' ||
      factory === '0x7702000000000000000000000000000000000000')
  ) {
    if (!authorization) return '0x7702000000000000000000000000000000000000'
    return concat([authorization.address, factoryData ?? '0x'])
  }
  if (!factory) return '0x'
  return concat([factory, factoryData ?? '0x'])
}
