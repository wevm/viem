import * as Chain from '../../core/Chain.js'

export const initVerse = /*#__PURE__*/ Chain.define({
  id: 7_233n,
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
      name: 'InitVerseScan',
      url: 'https://www.iniscan.com',
      apiUrl: 'https://explorer-api.inichain.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x83466BE48A067115FFF91f7b892Ed1726d032e47',
      blockCreated: 2318,
    },
  },
})
