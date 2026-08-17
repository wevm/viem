import * as Chain from '../../core/Chain.js'

export const hederaPreviewnet = /*#__PURE__*/ Chain.from({
  id: 297,
  name: 'Hedera Previewnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://previewnet.hashio.io/api',
  },
  blockExplorers: {
    name: 'Hashscan',
    url: 'https://hashscan.io/previewnet',
  },
  testnet: true,
})
