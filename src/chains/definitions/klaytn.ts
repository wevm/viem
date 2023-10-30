import { defineChain } from '../../utils/chain/defineChain.js'

export const klaytn = /*#__PURE__*/ defineChain({
  id: 8_217,
  name: 'Klaytn',
  nativeCurrency: {
    decimals: 18,
    name: 'Klaytn',
    symbol: 'KLAY',
  },
  rpcUrls: {
    default: { http: ['https://cypress.fautor.app/archive'] },
  },
  blockExplorers: {
    default: { name: 'KlaytnScope', url: 'https://scope.klaytn.com' },
  },
})
