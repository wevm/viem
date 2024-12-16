import { defineChain } from '../../utils/chain/defineChain.js'

export const initVerseGenesis = /*#__PURE__*/ defineChain({
  id: 7234,
  name: 'InitVerse Penesis Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Genesis InitVerse',
    symbol: 'INI',
  },
  rpcUrls: {
    default: { http: ['http://rpc-testnet.inichain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'InitverseScan',
      url: 'https://genesis-testnet.iniscan.com',
      apiUrl: 'https://explorer-testnet-api.inichain.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0cF32CBDd6c437331EA4f85ed2d881A5379B5a6F',
      blockCreated: 16361,
    },
  },
  testnet: true,
})
