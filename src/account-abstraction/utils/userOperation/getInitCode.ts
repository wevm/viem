import { concat } from '../../../utils/data/concat.js'
import type { UserOperation } from '../../types/userOperation.js'

export function getInitCode(
  userOperation: Pick<
    UserOperation,
    'authorization' | 'factory' | 'factoryData'
  >,
  options?: { forHash?: boolean },
) {
  const { authorization, factory, factoryData } = userOperation
  if (
    factory === '0x7702' ||
    factory === '0x7702000000000000000000000000000000000000'
  ) {
    // For hash calculation: substitute delegate address
    // For packing (ABI call): keep raw factory
    if (options?.forHash && authorization) {
      const delegation = authorization.address
      return concat([delegation, factoryData ?? '0x'])
    }
    if (!authorization) return '0x7702000000000000000000000000000000000000'
    return concat([factory, factoryData ?? '0x'])
  }
  if (!factory) return '0x'
  return concat([factory, factoryData ?? '0x'])
}
