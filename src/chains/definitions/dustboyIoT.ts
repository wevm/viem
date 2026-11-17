import * as Chain from '../../core/Chain.js'

export const dustboyIoT = /*#__PURE__*/ Chain.from({
  id: 555888,
  name: 'DustBoy IoT',
  nativeCurrency: { name: 'Ether', symbol: 'DST', decimals: 18 },
  rpcUrls: {
    http: 'https://dustboy-rpc.jibl2.com',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://dustboy.jibl2.com',
    apiUrl: 'https://dustboy.jibl2.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xFFD34aa2C62B2D52E00A361e466C229788f4eD6a',
      blockCreated: 526569,
    },
  },
  testnet: false,
})
