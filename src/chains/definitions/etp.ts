import * as Chain from '../../core/Chain.js'

export const etp = /*#__PURE__*/ Chain.define({
  id: 20_256_789n,
  name: 'ETP Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETP Chain Native Token',
    symbol: 'ETP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.etpscan.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'ETP Scan',
      url: 'https://etpscan.xyz',
    },
  },
})
