import type { Address } from '../../accounts/index.js'
import {
    ETHAddressInContracts,
    L2BaseTokenAddress,
    legacyETHAddress,
} from '../constants/address.js'

export function isETH(token: Address) {
    return (
        token.localeCompare(legacyETHAddress, undefined, {
            sensitivity: 'accent',
        }) === 0 ||
        token.localeCompare(L2BaseTokenAddress, undefined, {
            sensitivity: 'accent',
        }) === 0 ||
        token.localeCompare(ETHAddressInContracts, undefined, {
            sensitivity: 'accent',
        }) === 0
    )
}
