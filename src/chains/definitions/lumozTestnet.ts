import * as Chain from '../../core/Chain.js'

export const lumozTestnet = /*#__PURE__*/ Chain.from({
  id: 105_363,
  name: 'Lumoz Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lumoz Testnet Token',
    symbol: 'MOZ',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.lumoz.org'],
    },
  },
  testnet: true,
})
