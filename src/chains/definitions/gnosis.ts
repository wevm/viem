import { defineChain } from '../../utils/chain/defineChain.js'

export const gnosis = /*#__PURE__*/ defineChain({
  id: 100,
  name: 'Gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'Gnosis',
    symbol: 'xDAI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gnosischain.com'],
      webSocket: ['wss://rpc.gnosischain.com/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gnosisscan',
      url: 'https://gnosisscan.io',
      apiUrl: 'https://api.gnosisscan.io/api',
    },
    blockscout: {
      name: 'Gnosis Blockscout',
      url: 'https://gnosis.blockscout.com',
      apiUrl: 'https://gnosis.blockscout.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
})
