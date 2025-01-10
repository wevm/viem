import { defineChain } from '../../utils/chain/defineChain.js'

export const exsatTestnet = /*#__PURE__*/ defineChain({
  id: 839999,
  name: 'exSat Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BTC',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://evm-tst3.exsat.network'] },
  },
  blockExplorers: {
    default: {
      name: 'exSat Explorer',
      url: 'https://scan-testnet.exsat.network',
      apiUrl: 'https://scan-testnet.exsat.network/api',
    },
  },
})
