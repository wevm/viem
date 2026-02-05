import { defineChain } from '../../utils/chain/defineChain.js'

export const megaeth = /*#__PURE__*/ defineChain({
  id: 4326,
  blockTime: 1_000,
  name: 'MegaETH',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.megaeth.com/rpc'],
      webSocket: ['wss://mainnet.megaeth.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://mega.etherscan.io',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
    blockscout: {
      name: 'Etherscan',
      url: 'https://mega.etherscan.io',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
