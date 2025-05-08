import { concat } from '../../../utils/data/concat.js'
import type { UserOperation } from '../../types/userOperation.js'

export function getInitCode(
  userOperation: Pick<
    UserOperation,
    'authorization' | 'factory' | 'factoryData'
  >,
) {
  const { authorization, factory, factoryData } = userOperation
  if (
    factory === '0x7702' ||
    factory === '0x7702000000000000000000000000000000000000'
  ) {
    if (!authorization) return '0x7702000000000000000000000000000000000000'
    const delegation = authorization.address
    return concat([delegation, factoryData ?? '0x'])
  }
  if (!factory) return '0x'
  return concat([factory, factoryData ?? '0x'])
}
