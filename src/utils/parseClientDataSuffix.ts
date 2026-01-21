import type { DataSuffix } from 'types/dataSuffix.js'
import type { Hex } from 'types/misc.js'

export function parseClientDataSuffix(
  dataSuffix?: DataSuffix,
): Hex | undefined {
  if (!dataSuffix) {
    return undefined
  }

  return typeof dataSuffix === 'string' ? dataSuffix : dataSuffix.value
}
