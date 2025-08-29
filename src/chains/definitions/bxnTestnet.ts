import { defineChain } from '../../utils/chain/defineChain.js'

export const bxnTestnet = /*#__PURE__*/ defineChain({
  id: 4888,
  name: 'BlackFort Exchange Network Testnet',
  nativeCurrency: {
    name: 'BlackFort Testnet Token',
    symbol: 'TBXN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.blackfort.network/testnet/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet.blackfortscan.com',
      apiUrl: 'https://testnet.blackfortscan.com/api',
    },
  },
  testnet: true,
})
