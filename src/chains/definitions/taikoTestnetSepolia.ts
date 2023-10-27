import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoTestnetSepolia = /*#__PURE__*/ defineChain({
  id: 167005,
  name: 'Taiko (Alpha-3 Testnet)',
  network: 'taiko-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.taiko.xyz'],
    },
    public: {
      http: ['https://rpc.test.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.test.taiko.xyz',
    },
  },
})
