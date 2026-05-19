import * as Chain from '../../core/Chain.js'

export const cronosTestnet = /*#__PURE__*/ Chain.define({
  id: 338n,
  name: 'Cronos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CRO',
    symbol: 'tCRO',
  },
  rpcUrls: {
    default: { http: ['https://evm-t3.cronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Cronos Explorer (Testnet)',
      url: 'https://explorer.cronos.org/testnet',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 10191251,
    },
  },
  testnet: true,
})
