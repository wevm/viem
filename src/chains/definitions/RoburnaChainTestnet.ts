// src/chains/definitions/RoburnaChainTestnet.ts
import { defineChain } from '../../utils/chain/defineChain.js'

export const mainnet = /*#__PURE__*/ defineChain({
  id: 159,
  name: 'Roburna Chain Testnet',
  nativeCurrency: { name: 'Roburna', symbol: 'RBA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://preseed-testnet-1.roburna.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RbaScan',
      url: 'https://https://testnet.rbascan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x8655e717fA4157e1099F61bA261c2Cd7b121d661',
      blockCreated: 257467,
    },
  },
})
