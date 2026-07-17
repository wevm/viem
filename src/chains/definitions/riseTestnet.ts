import * as Chain from '../../core/Chain.js'

export const riseTestnet = /*#__PURE__*/ Chain.from({
  id: 11_155_931,
  name: 'RISE Testnet',
  nativeCurrency: { name: 'RISE Testnet Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.riselabs.xyz',
    ws: 'wss://testnet.riselabs.xyz/ws',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.testnet.riselabs.xyz/',
    apiUrl: 'https://explorer.testnet.riselabs.xyz/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: true,
})
