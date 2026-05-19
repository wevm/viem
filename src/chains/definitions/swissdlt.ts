import * as Chain from '../../core/Chain.js'

export const swissdlt = /*#__PURE__*/ Chain.define({
  id: 94n,
  name: 'SwissDLT Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BCTS',
    symbol: 'BCTS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.swissdlt.ch'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SwissDLT Explorer',
      url: 'https://explorer.swissdlt.ch',
    },
  },
  testnet: false,
})
