import * as Chain from '../../core/Chain.js'

export const zenchainTestnet = /*#__PURE__*/ Chain.from({
  id: 8408,
  name: 'ZenChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZTC',
    symbol: 'ZTC',
  },
  rpcUrls: {
    http: 'https://zenchain-testnet.api.onfinality.io/public',
    ws: 'wss://zenchain-testnet.api.onfinality.io/public-ws',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 230019,
    },
  },
  blockExplorers: {
    name: 'Zentrace',
    url: 'https://zentrace.io',
  },
  testnet: true,
})
