import * as Chain from '../../core/Chain.js'

export const sixProtocol = /*#__PURE__*/ Chain.define({
  id: 98n,
  name: 'Six Protocol',
  nativeCurrency: {
    decimals: 18,
    name: 'SIX',
    symbol: 'SIX',
  },
  rpcUrls: {
    default: {
      http: ['https://sixnet-rpc-evm.sixprotocol.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Six Protocol Scan',
      url: 'https://sixscan.io/sixnet',
    },
  },
  testnet: false,
})
