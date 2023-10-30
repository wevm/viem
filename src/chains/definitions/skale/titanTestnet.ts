import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleTitanTestnet = /*#__PURE__*/ defineChain({
  id: 1_517_929_550,
  name: 'SKALE | Titan Community Hub Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://staging-v3.skalenodes.com/v1/staging-aware-chief-gianfar',
      ],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-aware-chief-gianfar',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://staging-aware-chief-gianfar.explorer.staging-v3.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2085155,
    },
  },
  testnet: true,
})
