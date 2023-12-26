import { defineChain } from '../../utils/chain/defineChain.js'

export const zkFair = /*#__PURE__*/ defineChain({
  id: 42766,
  name: 'ZKFair Mainnet',
  network: 'zkfair-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.zkfair.io'],
    },
    public: {
      http: ['https://rpc.zkfair.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkFair Explorer',
      url: 'https://scan.zkfair.io',
    },
  },
  contracts: {
    multicall2: {
      address: '0x1CbC08bf0D48b18F9f97796c61352b192d1850A5',
      blockCreated: 6,
    },
  },
  testnet: false,
})
