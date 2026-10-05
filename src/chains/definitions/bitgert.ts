import * as Chain from '../../core/Chain.js'

export const bitgert = /*#__PURE__*/ Chain.from({
  id: 32520,
  name: 'Bitgert Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Brise',
    symbol: 'Brise',
  },
  rpcUrls: { http: 'https://rpc-bitgert.icecreamswap.com' },
  blockExplorers: {
    name: 'Bitgert Scan',
    url: 'https://brisescan.com',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2118034,
    },
  },
  testnet: false,
})
