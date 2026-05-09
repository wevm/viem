import { defineChain } from '../../utils/chain/defineChain.js'

export const initVerseGenesis = /*#__PURE__*/ defineChain({
  id: 7_234,
  name: 'InitVerse Genesis Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'InitVerse',
    symbol: 'INI',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.inichain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'InitVerseGenesisScan',
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
