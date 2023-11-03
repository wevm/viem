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
    default: { http: ['https://klaytn.drpc.org'] },
    public: { http: ['https://klaytn.drpc.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'KlaytnScope', url: 'https://scope.klaytn.com' },
    default: { name: 'KlaytnScope', url: 'https://scope.klaytn.com' },
  },
})
