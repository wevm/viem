import * as Chain from '../../core/Chain.js'

export const etp = /*#__PURE__*/ Chain.from({
  id: 20_256_789,
  name: 'ETP Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETP Chain Native Token',
    symbol: 'ETP',
  },
  rpcUrls: { http: 'https://rpc.etpscan.xyz' },
  blockExplorers: {
    name: 'ETP Scan',
    url: 'https://etpscan.xyz',
  },
})
