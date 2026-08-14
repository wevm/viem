import { defineChain } from '../../utils/chain/defineChain.js'

export const megaethTestnet = /*#__PURE__*/ defineChain({
  id: 6343,
  blockTime: 1_000,
  name: 'MegaETH Testnet',
  nativeCurrency: {
    name: 'MegaETH Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc'],
      webSocket: ['wss://carrot.megaeth.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://testnet-mega.etherscan.io',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://megaeth-testnet-v2.blockscout.com',
      apiUrl: 'https://megaeth-testnet-v2.blockscout.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
