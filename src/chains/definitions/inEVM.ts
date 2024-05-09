import { defineChain } from '../../utils/chain/defineChain.js'

export const inEVM = /*#__PURE__*/ defineChain({
  id: 2525,
  name: 'inEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Injective',
    symbol: 'INJ',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.rpc.inevm.com/http'] },
  },
  blockExplorers: {
    default: {
      name: 'inEVM Explorer',
      url: 'https://inevm.calderaexplorer.xyz',
      apiUrl: 'https://inevm.calderaexplorer.xyz/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 118606,
    },
  },
})
