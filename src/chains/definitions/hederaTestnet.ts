import * as Chain from '../../core/Chain.js'

export const hederaTestnet = /*#__PURE__*/ Chain.define({
  id: 296n,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hashscan',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
})
