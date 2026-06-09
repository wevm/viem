import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'
import { concatHex } from '../../../utils/data/concat.js'

/**
 * Builds the 45-byte ERC-1167 minimal proxy runtime bytecode that delegates to
 * `implementation`. This is the `code` deployed at an EIP-8130 account address
 * (see {@link computeAddress8130} and {@link toFactoryArgs8130}).
 */
export function erc1167Bytecode(implementation: Address): Hex {
  return concatHex([
    '0x363d3d373d3d3d363d73',
    implementation,
    '0x5af43d82803e903d91602b57fd5bf3',
  ])
}
