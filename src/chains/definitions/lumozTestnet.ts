import * as Chain from '../../core/Chain.js'

export const lumozTestnet = /*#__PURE__*/ Chain.define({
  id: 105_363n,
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
