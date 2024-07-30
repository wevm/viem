import { defineChain } from '../../utils/chain/defineChain.js'

export const jbcTestnet = /*#__PURE__*/ defineChain({
  id: 88991,
  name: 'Jibchain Testnet',
  nativeCurrency: { name: 'tJBC', symbol: 'tJBC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.jibchain.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://exp.testnet.jibchain.net',
      apiUrl: 'https://exp.testnet.jibchain.net/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xa1a858ad9041B4741e620355a3F96B3c78e70ecE',
      blockCreated: 32848,
    },
  },
  testnet: true,
})
