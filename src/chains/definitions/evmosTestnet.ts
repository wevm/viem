import { defineChain } from '../../utils/chain/defineChain.js'

export const evmosTestnet = /*#__PURE__*/ defineChain({
  id: 9_000,
  name: 'Evmos Testnet',
  network: 'evmos-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Evmos',
    symbol: 'EVMOS',
  },
  rpcUrls: {
    default: { http: ['https://eth.bd.evmos.dev:8545'] },
    public: { http: ['https://eth.bd.evmos.dev:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'Evmos Testnet Block Explorer',
      url: 'https://evm.evmos.dev/',
    },
  },
})
