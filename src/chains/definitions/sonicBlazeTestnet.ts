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
      url: 'https://blaze.soniclabs.com/', // https://testnet.sonicscan.org is now used in chain 14601. 
      // This chain will deprecate in future, use sonicTestnet 14601 instead.
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1100,
    },
  },
  testnet: true,
})
