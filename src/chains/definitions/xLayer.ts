import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const xLayer = /*#__PURE__*/ Chain.from({
  id: 196,
  name: 'X Layer Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  blockTime: 1_000,
  rpcUrls: { http: 'https://xlayerrpc.okx.com' },
  blockExplorers: {
    name: 'OKLink',
    url: 'https://www.oklink.com/xlayer',
    apiUrl: 'https://www.oklink.com/api/v5/explorer/xlayer/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 47416,
    },
  },
})
