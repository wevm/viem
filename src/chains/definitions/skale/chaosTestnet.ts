import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleChaosTestnet = /*#__PURE__*/ defineChain({
  id: 1_351_057_110,
  name: 'SKALE | Chaos Testnet',
  network: 'skale-chaos-testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix',
      ],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-fast-active-bellatrix',
      ],
    },
    public: {
      http: [
        'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix',
      ],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-fast-active-bellatrix',
      ],
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'SKALE Explorer',
      url: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com',
    },
    default: {
      name: 'SKALE Explorer',
      url: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1192202,
    },
  },
  testnet: true,
})
