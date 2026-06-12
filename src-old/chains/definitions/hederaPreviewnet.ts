import { defineChain } from '../../utils/chain/defineChain.js'

export const hederaPreviewnet = /*#__PURE__*/ defineChain({
  id: 297,
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
