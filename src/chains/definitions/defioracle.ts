import { defineChain } from '../../utils/chain/defineChain.js'

export const mainnet = /*#__PURE__*/ defineChain({
  id: 138,
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.defi-oracle.io", "wss://wss.defi-oracle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout Explorer',
      url: 'https://blockscout.defi-oracle.io',
    },
    blockscout: {
        name: 'Quorum Explorer',
        url: 'https://explorer.defi-oracle.io',
      },
  },
  contracts: {
    ensRegistry: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensUniversalResolver: {
      address: 'tbd',
      blockCreated: tbd,
    },
    multicall3: {
      address: 'tbd',
      blockCreated: tbd,
    },
  },
})