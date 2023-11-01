import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleEuropaTestnet = /*#__PURE__*/ defineChain({
  id: 476_158_412,
  name: 'SKALE | Europa Liquidity Hub Testnet',
  network: 'skale-europa-testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor'],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-legal-crazy-castor',
      ],
    },
    public: {
      http: ['https://staging-v3.skalenodes.com/v1/staging-legal-crazy-castor'],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-legal-crazy-castor',
      ],
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'SKALE Explorer',
      url: 'https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com',
    },
    default: {
      name: 'SKALE Explorer',
      url: 'https://staging-legal-crazy-castor.explorer.staging-v3.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2071911,
    },
  },
  testnet: true,
})
