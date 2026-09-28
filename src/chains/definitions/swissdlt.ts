import * as Chain from '../../core/Chain.js'

export const swissdlt = /*#__PURE__*/ Chain.from({
  id: 94,
  name: 'SwissDLT Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BCTS',
    symbol: 'BCTS',
  },
  rpcUrls: {
    http: 'https://rpc.swissdlt.ch',
  },
  blockExplorers: {
    name: 'SwissDLT Explorer',
    url: 'https://explorer.swissdlt.ch',
  },
  testnet: false,
})
