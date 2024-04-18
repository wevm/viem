import { defineChain } from '../../utils/chain/defineChain.js'

export const xLayer = /*#__PURE__*/ defineChain({
  id: 196,
  name: 'X Layer Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: {
      name: 'OKLink',
      url: 'https://www.oklink.com/xlayer',
    },
  },
})
