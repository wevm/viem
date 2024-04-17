import { defineChain } from '../../utils/chain/defineChain.js'

export const xLayer = /*#__PURE__*/ defineChain({
  id: 196,
  name: 'X Layer mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech/'] },
  },
  blockExplorers: {
    default: {
      name: 'OKLink',
      url: 'https://www.oklink.com/xlayer',
    },
  },
  contracts: {
    multicall3: {
      address: '0x8A42F70047a99298822dD1dbA34b454fc49913F2',
      blockCreated: 67224,
    },
  },
})

export { xLayer as x1 }
