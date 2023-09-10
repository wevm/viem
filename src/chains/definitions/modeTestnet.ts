import { defineChain } from '../../utils/chain.js'

export const modeTestnet = /*#__PURE__*/ defineChain({
  id: 919,
  name: 'Mode Testnet',
  network: 'mode-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.mode.network'],
    },
    public: {
      http: ['https://sepolia.mode.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia.explorer.mode.network',
    },
  },
  testnet: true,
})
