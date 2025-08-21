import { defineChain } from '../../utils/chain/defineChain.js'

// 64165 deprecated for 57054 and with Sonic Labs newest Pectra upgrade
// 57054 is going to deprecate for this new 14601 chain.
// Since rpc is same on this one with 64165, override the old infos here.

export const sonicTestnet = /*#__PURE__*/ defineChain({
  id: 14_601,
  name: 'Sonic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Testnet Explorer',
      url: 'https://testnet.soniclabs.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 12810,
    },
  },  
  testnet: true,
})
