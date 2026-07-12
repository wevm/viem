import { defineChain } from '../../utils/chain/defineChain.js'

export const defiOracleMetaMainnet = /*#__PURE__*/ defineChain({
  id: 138,
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-http-pub.d-bis.org',
        'https://rpc.d-bis.org',
        'https://rpc2.d-bis.org',
        'https://rpc.public-0138.defi-oracle.io',
        'https://rpc.defi-oracle.io',
      ],
      webSocket: [
        'wss://rpc-ws-pub.d-bis.org',
        'wss://ws.rpc.d-bis.org',
        'wss://ws.rpc2.d-bis.org',
        'wss://rpc.public-0138.defi-oracle.io',
        'wss://wss.defi-oracle.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.d-bis.org',
    },
  },
})
