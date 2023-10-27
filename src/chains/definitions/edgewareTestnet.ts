import { defineChain } from '../../utils/chain/defineChain.js'

export const edgewareTestnet = /*#__PURE__*/ defineChain({
  id: 2022,
  name: 'Beresheet BereEVM Testnet',
  network: 'edgewareTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet EDG',
    symbol: 'tEDG',
  },
  rpcUrls: {
    default: { http: ['https://beresheet-evm.jelliedowl.net'] },
    public: { http: ['https://beresheet-evm.jelliedowl.net'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Edgscan by Bharathcoorg',
      url: 'https://testnet.edgscan.live',
    },
    default: {
      name: 'Edgscan by Bharathcoorg',
      url: 'https://testnet.edgscan.live',
    },
  },
})
