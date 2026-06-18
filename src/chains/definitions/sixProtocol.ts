import * as Chain from '../../core/Chain.js'

export const sixProtocol = /*#__PURE__*/ Chain.from({
  id: 98,
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
