import * as Chain from '../../core/Chain.js'

export const thunderCore = /*#__PURE__*/ Chain.define({
  id: 108n,
  name: 'ThunderCore Mainnet',
  nativeCurrency: { name: 'TT', symbol: 'TT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.thundercore.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ThunderCore Explorer',
      url: 'https://explorer-mainnet.thundercore.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
})
