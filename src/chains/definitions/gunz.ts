import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const gunz = /*#__PURE__*/ Chain.from({
  id: 43_419,
  name: 'Gunz Mainnet',
  nativeCurrency: { name: 'GUN', symbol: 'GUN', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.gunzchain.io/ext/bc/2M47TxWHGnhNtq6pM5zPXdATBtuqubxn5EPFgFmEawCQr9WFML/rpc',
  },
  blockExplorers: {
    name: 'Gunz Explorer',
    url: 'https://gunzscan.io/',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 70502,
    },
  },
})
