import { defineChain } from '../../utils/chain/defineChain.js'

export const lightlinkPhoenix = /*#__PURE__*/ defineChain({
  id: 1_890,
  name: 'LightLink Phoenix Mainnet',
  network: 'lightlink-phoenix',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://replicator.phoenix.lightlink.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LightLink Phoenix Explorer',
      url: 'https://phoenix.lightlink.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 125_499_184,
    },
  },
  testnet: false,
})
