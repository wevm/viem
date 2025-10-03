import { defineChain } from '../../utils/chain/defineChain.js'

export const camp = /*#__PURE__*/ defineChain({
  id: 484,
  name: 'Camp Network Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Camp',
    symbol: 'CAMP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.camp.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://camp.cloud.blockscout.com/',
    },
  }, 
})
