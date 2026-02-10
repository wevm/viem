import { defineChain } from '../../utils/chain/defineChain.js'

export const onyx = /*#__PURE__*/ defineChain({
  id: 80888,
  name: 'Onyx Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Onyxcoin',
    symbol: 'XCN',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.onyx.org'],
      webSocket: ['wss://rpc.onyx.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Onyx Explorer',
      url: 'https://explorer.onyx.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 23832497,
    },
  },
  testnet: false,
})