import { defineChain } from '../../utils/chain/defineChain.js'

  export const ladyChain = /*#__PURE__*/ defineChain({
    id: 589,
    name: 'LadyChain',
    nativeCurrency: { name: 'Lady', symbol: 'LADY', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://ladyrpc.us/rpc'],
      },
    },
    blockExplorers: {
      default: {
        name: 'LadyScan',
        url: 'https://ladyscan.us',
      },
    },
    testnet: false,
  })
  