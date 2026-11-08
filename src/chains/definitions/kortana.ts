import * as Chain from '../../core/Chain.js'

export const kortana = /*#__PURE__*/ Chain.from({
  id: 9002,
  name: 'Kortana',
  nativeCurrency: {
    decimals: 18,
    name: 'Dinar',
    symbol: 'DNR',
  },
  rpcUrls: { http: 'https://zeus-rpc.mainnet.kortana.xyz' },
  blockExplorers: {
    name: 'Kortana Explorer',
    url: 'https://explorer.mainnet.kortana.xyz',
  },
})
