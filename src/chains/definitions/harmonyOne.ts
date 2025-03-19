import { defineChain } from '../../utils/chain/defineChain.js'

export const harmonyOne = /*#__PURE__*/ defineChain({
  id: 1_666_600_000,
  name: 'Harmony One',
  nativeCurrency: {
    name: 'Harmony',
    symbol: 'ONE',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://1666600000.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Harmony Explorer',
      url: 'https://explorer.harmony.one',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 24185753,
    },
  },
})
