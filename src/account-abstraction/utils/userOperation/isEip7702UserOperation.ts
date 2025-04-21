import type { UserOperation } from '../../types/userOperation.js'

const eip7702Marker = '0x7702000000000000000000000000000000000000'

export function isEip7702UserOperation(userOperation: UserOperation) {
  if (!userOperation.authorization) return false
  if (userOperation.initCode) {
    if (
      userOperation.initCode === '0x7702' ||
      userOperation.initCode === eip7702Marker
    )
      return true
  }
  if (userOperation.factory) {
    if (
      userOperation.factory === '0x7702' ||
      userOperation.factory === eip7702Marker
    )
      return true
  }
  return false
}
