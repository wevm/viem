import * as Chain from '../../core/Chain.js'

export const sapphire = /*#__PURE__*/ Chain.from({
  id: 23294,
  name: 'Oasis Sapphire',
  nativeCurrency: { name: 'Sapphire Rose', symbol: 'ROSE', decimals: 18 },
  rpcUrls: {
    http: 'https://sapphire.oasis.io',
    ws: 'wss://sapphire.oasis.io/ws',
  },
  blockExplorers: {
    name: 'Oasis Explorer',
    url: 'https://explorer.oasis.io/mainnet/sapphire',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 734531,
    },
  },
})
