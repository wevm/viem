import { defineChain } from '../../utils/chain/defineChain.js'

export const klaytn = /*#__PURE__*/ defineChain({
  id: 8_217,
  name: 'Klaytn',
  network: 'klaytn',
  nativeCurrency: {
    decimals: 18,
    name: 'Klaytn',
    symbol: 'KLAY',
  },
  rpcUrls: {
    default: { http: ['https://public-en-cypress.klaytn.net'] },
    public: { http: ['https://public-en-cypress.klaytn.net'] },
  },
  blockExplorers: {
    etherscan: { name: 'KlaytnScope', url: 'https://scope.klaytn.com' },
    default: { name: 'KlaytnScope', url: 'https://scope.klaytn.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 96002415,
    },
  },
})
