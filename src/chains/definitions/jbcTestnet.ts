import * as Chain from '../../core/Chain.js'

export const jbcTestnet = /*#__PURE__*/ Chain.from({
  id: 88991,
  name: 'Jibchain Testnet',
  nativeCurrency: { name: 'tJBC', symbol: 'tJBC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.jibchain.net',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://exp.testnet.jibchain.net',
    apiUrl: 'https://exp.testnet.jibchain.net/api',
  },
  contracts: {
    multicall3: {
      address: '0xa1a858ad9041B4741e620355a3F96B3c78e70ecE',
      blockCreated: 32848,
    },
  },
  testnet: true,
})
