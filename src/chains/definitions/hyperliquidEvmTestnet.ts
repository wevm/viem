import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperliquidEvmTestnet = /*#__PURE__*/ defineChain({
  id: 998,
  name: 'Hyperliquid EVM Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Purrsec (testnet)',
      url: 'https://testnet.purrsec.com/',
      apiUrl: 'https://api.parsec.finance/api/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 13051,
    },
  },
})