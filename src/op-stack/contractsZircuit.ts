import type { Chain } from '../types/chainZircuit.js'

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
    withdrawalRootStorageSlot:
      '0x000000000000000000000000000000000000000000000000000000000000000f',
    msgNonceStorageSlot:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    leftHashesOffset: 16,
  },
} as const satisfies Chain['contracts']
