import { defineChain } from '../../utils/chain/defineChain.js'

export const gravity = /*#__PURE__*/ defineChain({
  id: 1625,
  name: 'Gravity Alpha Mainnet',
  nativeCurrency: { name: 'G', symbol: 'G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.gravity.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gravity Explorer',
      url: 'https://explorer.gravity.xyz',
      apiUrl: 'https://explorer.gravity.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xf8ac4BEB2F75d2cFFb588c63251347fdD629B92c',
      blockCreated: 16851,
    },
  },
})
