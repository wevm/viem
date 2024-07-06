import { defineChain } from '../../utils/chain/defineChain.js'

export const bxnTestnet = /*#__PURE__*/ defineChain({
  id: 4777,
  name: 'BlackFort Exchange Network Testnet',
  nativeCurrency: {
    name: 'BlackFort Testnet Token',
    symbol: 'TBXN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.blackfort.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.blackfort.network',
      apiUrl: 'https://testnet-explorer.blackfort.network/api',
    },
    blockscout: {
      name: 'BlackFort Exchange Network Testnet Blockscout',
      url: 'https://blackfort-testnet.blockscout.com',
      apiUrl: 'https://blackfort-testnet.blockscout.com/api',
    },
  },
  testnet: true,
})
