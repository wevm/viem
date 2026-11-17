import * as Chain from '../../core/Chain.js'

export const evmosTestnet = /*#__PURE__*/ Chain.from({
  id: 9_000,
  name: 'Evmos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Evmos',
    symbol: 'EVMOS',
  },
  rpcUrls: { http: 'https://eth.bd.evmos.dev:8545' },
  blockExplorers: {
    name: 'Evmos Testnet Block Explorer',
    url: 'https://evm.evmos.dev/',
  },
  testnet: true,
})
