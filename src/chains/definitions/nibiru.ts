import * as Chain from '../../core/Chain.js'

export const nibiru = /*#__PURE__*/ Chain.from({
  id: 6900,
  name: 'Nibiru',
  nativeCurrency: {
    decimals: 18,
    name: 'NIBI',
    symbol: 'NIBI',
  },
  rpcUrls: { http: 'https://evm-rpc.nibiru.fi' },
  blockExplorers: {
    name: 'NibiScan',
    url: 'https://nibiscan.io',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 19587573,
    },
  },
})
