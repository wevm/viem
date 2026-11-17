import * as Chain from '../../core/Chain.js'

export const ladyChain = /*#__PURE__*/ Chain.from({
  id: 589,
  name: 'LadyChain',
  nativeCurrency: { name: 'Lady', symbol: 'LADY', decimals: 18 },
  rpcUrls: {
    http: 'https://ladyrpc.us/rpc',
  },
  blockExplorers: {
    name: 'LadyScan',
    url: 'https://ladyscan.us',
  },
  testnet: false,
})
