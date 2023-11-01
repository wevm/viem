import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleNebulaTestnet = /*#__PURE__*/ defineChain({
  id: 503_129_905,
  name: 'SKALE | Nebula Gaming Hub Testnet',
  network: 'skale-nebula-testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird'],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-faint-slimy-achird',
      ],
    },
    public: {
      http: ['https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird'],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-faint-slimy-achird',
      ],
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'SKALE Explorer',
      url: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com',
    },
    default: {
      name: 'SKALE Explorer',
      url: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2205882,
    },
  },
  testnet: true,
})
