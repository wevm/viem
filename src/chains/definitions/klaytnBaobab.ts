import { defineChain } from '../../utils/chain/defineChain.js'

export const klaytnBaobab = /*#__PURE__*/ defineChain({
  id: 1_001,
  name: 'Klaytn Baobab Testnet',
  network: 'klaytn-baobab',
  nativeCurrency: {
    decimals: 18,
    name: 'Baobab Klaytn',
    symbol: 'KLAY',
  },
  rpcUrls: {
    default: { http: ['https://public-en-baobab.klaytn.net'] },
    public: { http: ['https://public-en-baobab.klaytn.net'] },
  },
  blockExplorers: {
    etherscan: { name: 'KlaytnScope', url: 'https://baobab.klaytnscope.com' },
    default: { name: 'KlaytnScope', url: 'https://baobab.klaytnscope.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 123390593,
    },
  },
  testnet: true,
})
