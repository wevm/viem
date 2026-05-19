import * as Chain from '../../core/Chain.js'

export const evmosTestnet = /*#__PURE__*/ Chain.define({
  id: 9_000n,
  name: 'Evmos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Evmos',
    symbol: 'EVMOS',
  },
  rpcUrls: {
    default: { http: ['https://eth.bd.evmos.dev:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'Evmos Testnet Block Explorer',
      url: 'https://evm.evmos.dev/',
    },
  },
  testnet: true,
})
