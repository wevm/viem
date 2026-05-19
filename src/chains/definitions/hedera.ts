import * as Chain from '../../core/Chain.js'

export const hedera = /*#__PURE__*/ Chain.define({
  id: 295n,
  name: 'Hedera Mainnet',
  network: 'hedera-mainnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hashscan',
      url: 'https://hashscan.io/mainnet',
    },
  },
  testnet: false,
})
