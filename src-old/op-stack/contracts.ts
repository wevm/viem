import type { Chain } from '../types/chain.js'

/**
 * Predeploy contracts for OP Stack.
 * @see https://github.com/ethereum-optimism/optimism/blob/develop/specs/predeploys.md
 */
export const contracts = {
  gasPriceOracle: { address: '0x420000000000000000000000000000000000000F' },
  l1Block: { address: '0x4200000000000000000000000000000000000015' },
  l2CrossDomainMessenger: {
    address: '0x4200000000000000000000000000000000000007',
  },
  l2Erc721Bridge: { address: '0x4200000000000000000000000000000000000014' },
  l2StandardBridge: { address: '0x4200000000000000000000000000000000000010' },
  l2ToL1MessagePasser: {
    address: '0x4200000000000000000000000000000000000016',
  },
} as const satisfies Chain['contracts']
