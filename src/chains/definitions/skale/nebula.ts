import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleNebula = /*#__PURE__*/ defineChain({
  id: 1_482_601_649,
  name: 'SKALE Nebula Hub',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/green-giddy-denebola'],
      webSocket: ['wss://mainnet.skalenodes.com/v1/ws/green-giddy-denebola'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://green-giddy-denebola.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2_372_986,
    },
  },
})
