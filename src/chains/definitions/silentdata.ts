import * as Chain from '../../core/Chain.js'

export const silentData = /*#__PURE__*/ Chain.from({
  id: 380_929,
  name: 'Silent Data Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.silentdata.com',
  },
  blockExplorers: {
    name: 'Silent Data Mainnet Explorer',
    url: 'https://explorer-mainnet.rollup.silentdata.com',
  },
  testnet: false,
})
