import { defineChain } from '../../utils/chain/defineChain.js'

export const dogechain = /*#__PURE__*/ defineChain({
  id: 2_000,
  name: 'Dogechain',
  nativeCurrency: {
    decimals: 18,
    name: 'Wrapped Dogecoin',
    symbol: 'WDOGE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.dogechain.dog'] },
  },
  blockExplorers: {
    default: {
      name: 'DogeChainExplorer',
      url: 'https://explorer.dogechain.dog',
      apiUrl: 'https://explorer.dogechain.dog/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x68a8609a60a008EFA633dfdec592c03B030cC508',
      blockCreated: 25384031,
    },
  },
})
