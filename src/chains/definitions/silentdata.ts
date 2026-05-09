import { defineChain } from '../../utils/chain/defineChain.js'

export const silentData = /*#__PURE__*/ defineChain({
  id: 380_929,
  name: 'Silent Data Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.silentdata.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Silent Data Mainnet Explorer',
      url: 'https://explorer-mainnet.rollup.silentdata.com',
    },
  },
  testnet: false,
})
