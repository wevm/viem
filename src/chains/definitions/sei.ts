import { defineChain } from '../../utils/chain/defineChain.js'

export const sei = /*#__PURE__*/ defineChain({
  id: 1329,
  name: 'Sei Network',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.sei-apis.com/'],
      webSocket: ['wss://evm-ws.sei-apis.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seiscan',
      url: 'https://seiscan.io',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  tokens: {
    usdc: {
      address: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'erc20',
    },
  },
})
