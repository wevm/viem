import { defineChain } from '../../utils/chain/defineChain.js'

export const basecampTestnet = /*#__PURE__*/ defineChain({
  id: 123420001114,
  name: 'Basecamp Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Camp',
    symbol: 'CAMP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: {
      name: 'basecamp',
      url: 'https://basecamp.cloud.blockscout.com',
    },
  },
  testnet: true,
})
