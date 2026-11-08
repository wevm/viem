import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const okc = /*#__PURE__*/ Chain.from({
  id: 66,
  name: 'OKC',
  nativeCurrency: {
    decimals: 18,
    name: 'OKT',
    symbol: 'OKT',
  },
  rpcUrls: { http: 'https://exchainrpc.okex.org' },
  blockExplorers: {
    name: 'oklink',
    url: 'https://www.oklink.com/okc',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 10364792,
    },
  },
})
