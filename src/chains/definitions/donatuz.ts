import * as Chain from '../../core/Chain.js'

export const donatuz = /*#__PURE__*/ Chain.from({
  id: 42_026,
  name: 'Donatuz',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://rpc.donatuz.com' },
  blockExplorers: {
    name: 'Donatuz Explorer',
    url: 'https://explorer.donatuz.com',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
