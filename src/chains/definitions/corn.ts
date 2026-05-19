import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const corn = /*#__PURE__*/ Chain.define({
  id: 21_000_000n,
  name: 'Corn',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcorn',
    symbol: 'BTCN',
  },
  rpcUrls: {
    default: { http: ['https://21000000.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Corn Explorer',
      url: 'https://cornscan.io',
      apiUrl:
        'https://api.routescan.io/v2/network/mainnet/evm/21000000/etherscan/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3228,
    },
  },
  sourceId,
})
