import * as Chain from '../../core/Chain.js'

export const silentData = /*#__PURE__*/ Chain.define({
  id: 380_929n,
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
