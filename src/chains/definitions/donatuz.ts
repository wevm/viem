import { defineChain } from '../../utils/chain/defineChain.js'

export const donatuz = /*#__PURE__*/ defineChain({
  id: 42_026,
  name: 'Donatuz',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.donatuz.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Donatuz Explorer',
      url: 'https://explorer.donatuz.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
