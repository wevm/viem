import * as Chain from '../../core/Chain.js'

export const cyber = /*#__PURE__*/ Chain.from({
  id: 7_560,
  name: 'Cyber',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://cyber.alt.technology',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://cyberscan.co',
    apiUrl: 'https://cyberscan.co/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
