import { defineChain } from '../../utils/chain/defineChain.js'

export const bxnTestnet = /*#__PURE__*/ defineChain({
  id: 4777,
  name: 'BlackFort Exchange Network Testnet',
  network: 'bxnTestnet',
  nativeCurrency: {
    name: 'BlackFort Testnet Token',
    symbol: 'TBXN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.blackfort.network/rpc'],
    },
    public: {
      http: ['https://testnet.blackfort.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.blackfort.network',
    },
  },
})
