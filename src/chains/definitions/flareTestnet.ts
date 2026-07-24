import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const flareTestnet = /*#__PURE__*/ Chain.from({
  id: 114,
  name: 'Flare Testnet Coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: { http: 'https://coston2-api.flare.network/ext/C/rpc' },
  blockExplorers: {
    name: 'Coston2 Explorer',
    url: 'https://coston2-explorer.flare.network',
    apiUrl: 'https://coston2-explorer.flare.network/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
