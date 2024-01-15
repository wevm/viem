import { defineChain } from '../../utils/chain/defineChain.js'

export const bronosTestnet = /*#__PURE__*/ defineChain({
  id: 1038,
  name: 'Bronos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bronos Coin',
    symbol: 'tBRO',
  },
  rpcUrls: {
    default: { http: ['https://evm-testnet.bronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BronoScan',
      url: 'https://tbroscan.bronos.org',
    },
  },
  testnet: true,
})
