import type { Address } from '../../../accounts/index.js'
import { pad, toHex } from '../../../utils/index.js'
import { addressModulo, l1ToL2AliasOffset } from '../../constants/address.js'

/**
 * Converts the address that submitted a transaction to the inbox on L1 to the `msg.sender` viewed on L2.
 * Returns the `msg.sender` of the `L1->L2` transaction as the address of the contract that initiated the transaction.
 *
 * All available cases:
 * - During a normal transaction, if contract `A` calls contract `B`, the `msg.sender` is `A`.
 * - During `L1->L2` communication, if an EOA `X` calls contract `B`, the `msg.sender` is `X`.
 * - During `L1->L2` communication, if a contract `A` calls contract `B`, the `msg.sender` is `applyL1ToL2Alias(A)`.
 *
 * @param address - The address of the contract.
 * @returns address - The transformed address representing the `msg.sender` on L2.
 *
 * @example
 * import { applyL1ToL2Alias } from 'viem/zksync'
 *
 * const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb";
 * const l2ContractAddress = utils.applyL1ToL2Alias(l1ContractAddress);
 * // l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC"
 */
export function applyL1ToL2Alias(address: Address): Address {
  return pad(
    toHex((BigInt(address) + BigInt(l1ToL2AliasOffset)) % addressModulo),
    { size: 20 },
  )
}
