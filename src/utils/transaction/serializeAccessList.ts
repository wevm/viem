import { InvalidAddressError } from '../../errors/address.js'
import { InvalidStorageKeySizeError } from '../../errors/transaction.js'
import type { Hex } from '../../types/misc.js'
import type { AccessList } from '../../types/transaction.js'
import { isAddress } from '../address/isAddress.js'
import { type RecursiveArray } from '../encoding/toRlp.js'

export function serializeAccessList(
  accessList?: AccessList,
): RecursiveArray<Hex> {
  if (!accessList || accessList.length === 0) return []

  const serializedAccessList: RecursiveArray<Hex> = []
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i]

    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] })
      }
    }

    if (!isAddress(address)) {
      throw new InvalidAddressError({ address })
    }

    serializedAccessList.push([address, storageKeys])
  }
  return serializedAccessList
}
