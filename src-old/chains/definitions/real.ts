import { defineChain } from '../../utils/chain/defineChain.js'

export const real = /*#__PURE__*/ defineChain({
  id: 111188,
  name: 're.al',
  nativeCurrency: {
    name: 'reETH',
    decimals: 18,
    symbol: 'reETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.realforreal.gelato.digital'] },
  },
  blockExplorers: {
    default: {
      name: 're.al Explorer',
      url: 'https://explorer.re.al',
      apiUrl: 'https://explorer.re.al/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 695,
    },
  },
})
