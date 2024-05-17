import { defineChain } from '../../utils/chain/defineChain.js'

export const bobTestnet = defineChain({
  id: 111,
  name: 'BOB Testnet',
  network: 'bob-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: {
      http: ['https://testnet.rpc.gobob.xyz/'],
      webSocket: ['wss://testnet.rpc.gobob.xyz'],
    },
    default: {
      http: [`https://testnet.rpc.gobob.xyz/`],
      webSocket: [`wss://testnet.rpc.gobob.xyz`],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.gobob.xyz/',
    },
    etherscan: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.gobob.xyz/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 8526821,
    },
  },
  testnet: true,
});