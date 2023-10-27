import { defineChain } from '../../utils/chain/defineChain.js'

export const lineaTestnet = /*#__PURE__*/ defineChain({
  id: 59_140,
  name: 'Linea Goerli Testnet',
  network: 'linea-testnet',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    infura: {
      http: ['https://linea-goerli.infura.io/v3'],
      webSocket: ['wss://linea-goerli.infura.io/ws/v3'],
    },
    default: {
      http: ['https://rpc.goerli.linea.build'],
      webSocket: ['wss://rpc.goerli.linea.build'],
    },
    public: {
      http: ['https://rpc.goerli.linea.build'],
      webSocket: ['wss://rpc.goerli.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://goerli.lineascan.build',
    },
    etherscan: {
      name: 'Etherscan',
      url: 'https://goerli.lineascan.build',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://explorer.goerli.linea.build',
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
