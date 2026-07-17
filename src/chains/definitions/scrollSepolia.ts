import * as Chain from '../../core/Chain.js'

export const scrollSepolia = /*#__PURE__*/ Chain.from({
  id: 534_351,
  name: 'Scroll Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://sepolia-rpc.scroll.io',
  },
  blockExplorers: {
    name: 'Scrollscan',
    url: 'https://sepolia.scrollscan.com',
    apiUrl: 'https://api-sepolia.scrollscan.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 9473,
    },
  },
  testnet: true,
})
