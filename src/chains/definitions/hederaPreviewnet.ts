import * as Chain from '../../core/Chain.js'

export const hederaPreviewnet = /*#__PURE__*/ Chain.define({
  id: 297n,
  name: 'Hedera Previewnet',
  network: 'hedera-previewnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://previewnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hashscan',
      url: 'https://hashscan.io/previewnet',
    },
  },
  testnet: true,
})
