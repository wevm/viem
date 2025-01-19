import { defineChain } from '../../utils/chain/defineChain.js'

export const initVerse = /*#__PURE__*/ defineChain({
  id: 7_233,
  name: 'InitVerse Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'InitVerse',
    symbol: 'INI',
  },
  rpcUrls: {
    default: { http: ['https://rpc-mainnet.inichain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'InitVerse Explorer',
      url: 'https://iniscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0cF32CBDd6c437331EA4f85ed2d881A5379B5a6F',
      blockCreated: 0,
    },
  },
})
