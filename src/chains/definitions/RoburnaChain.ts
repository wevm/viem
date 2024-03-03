// src/chains/definitions/RoburnaChain.ts
import { defineChain } from '../../utils/chain/defineChain.js'

export const mainnet = /*#__PURE__*/ defineChain({
  id: 158,
  name: 'Roburna Chain',
  nativeCurrency: { name: 'Roburna', symbol: 'RBA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dataseed.roburna.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RbaScan',
      url: 'https://https://rbascan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x6eFEC35906F015b704C29EECE2E403fD6A587743',
      blockCreated: 203225,
    },
  },
})
