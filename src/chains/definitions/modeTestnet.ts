import { defineChain } from '../../utils/chain/defineChain.js'

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
  contracts: {
    multicall3: {
      address: '0xBAba8373113Fb7a68f195deF18732e01aF8eDfCF',
      blockCreated: 3019007,
    },
  },
  testnet: true,
})
