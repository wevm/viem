import * as Chain from '../../core/Chain.js'

export const katana = /*#__PURE__*/ Chain.define({
  id: 747474n,
  name: 'Katana',
  network: 'katana',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.katana.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'katana explorer',
      url: 'https://katanascan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
})
