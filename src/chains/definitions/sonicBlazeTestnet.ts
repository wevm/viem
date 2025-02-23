import { defineChain } from '../../utils/chain/defineChain.js'

export const sonicBlazeTestnet = /*#__PURE__*/ defineChain({
  id: 57_054,
  name: 'Sonic Blaze Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Blaze Testnet Explorer',
      url: 'https://testnet.sonicscan.org',
    },
  },
  testnet: true,
})
