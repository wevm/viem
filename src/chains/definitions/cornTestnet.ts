import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const cornTestnet = /*#__PURE__*/ Chain.define({
  id: 21_000_001n,
  name: 'Corn Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcorn',
    symbol: 'BTCN',
  },
  rpcUrls: {
    default: { http: ['https://21000001.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Corn Testnet Explorer',
      url: 'https://testnet.cornscan.io',
      apiUrl:
        'https://api.routescan.io/v2/network/testnet/evm/21000001/etherscan/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4886,
    },
  },
  testnet: true,
  sourceId,
})
