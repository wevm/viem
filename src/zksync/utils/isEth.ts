import type { Address } from '../../accounts/index.js'
import {
  ethAddressInContracts,
  l2BaseTokenAddress,
  legacyEthAddress,
} from '../constants/address.js'

export function isEth(token: Address) {
  return (
    token.localeCompare(legacyEthAddress, undefined, {
      sensitivity: 'accent',
    }) === 0 ||
    token.localeCompare(l2BaseTokenAddress, undefined, {
      sensitivity: 'accent',
    }) === 0 ||
    token.localeCompare(ethAddressInContracts, undefined, {
      sensitivity: 'accent',
    }) === 0
  )
}
