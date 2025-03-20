import type { Address } from '../../../accounts/index.js'
import { pad, toHex } from '../../../utils/index.js'
import { addressModulo, l1ToL2AliasOffset } from '../../constants/address.js'

/**
 * Converts and returns the `msg.sender` viewed on L2 to the address that submitted a transaction to the inbox on L1.
 *
 * @param address - The sender address viewed on L2.
 * @returns address - The hash of the L2 priority operation.
 *
 * @example
 * import { undoL1ToL2Alias } from 'viem/zksync'
 *
 * const l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC";
 * const l1ContractAddress = utils.undoL1ToL2Alias(l2ContractAddress);
 * // const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb"
 */
export function undoL1ToL2Alias(address: Address): Address {
  let result = BigInt(address) - BigInt(l1ToL2AliasOffset)
  if (result < 0n) result += addressModulo
  return pad(toHex(result), { size: 20 })
}
