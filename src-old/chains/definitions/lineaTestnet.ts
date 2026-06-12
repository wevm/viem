import { defineChain } from '../../utils/chain/defineChain.js'

export const lineaTestnet = /*#__PURE__*/ defineChain({
  id: 59_140,
  name: 'Linea Goerli Testnet',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.goerli.linea.build'],
      webSocket: ['wss://rpc.goerli.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://goerli.lineascan.build',
      apiUrl: 'https://goerli.lineascan.build/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 498623,
    },
  },
  testnet: true,
})
