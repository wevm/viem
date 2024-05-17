import { defineChain } from '../../utils/chain/defineChain.js'

export const bob = defineChain({
  id: 60808,
  name: 'BOB',
  network: 'bob',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: {
      http: ['https://rpc.gobob.xyz'],
      webSocket: ['wss://rpc.gobob.xyz'],
    },
    default: {
      http: [`https://rpc.gobob.xyz`],
      webSocket: [`wss://rpc.gobob.xyz`],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.gobob.xyz',
    },
    etherscan: {
      name: 'Blockscout',
      url: 'https://explorer.gobob.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0x63f8279bccDb75c0F38e0CD6B6A0c72a0a760FF9',
      blockCreated: 457045,
    },
  },
  testnet: false,
});