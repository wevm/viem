import * as Chain from '../../core/Chain.js'

export const citrate = /*#__PURE__*/ Chain.from({
  id: 40_204,
  name: 'Citrate',
  nativeCurrency: { name: 'SALT', symbol: 'SALT', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.citrate.ai',
    ws: 'wss://rpc.citrate.ai',
  },
  testnet: true,
})
