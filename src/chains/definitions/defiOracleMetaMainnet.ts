import * as Chain from '../../core/Chain.js'

export const defiOracleMetaMainnet = /*#__PURE__*/ Chain.from({
  id: 138,
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: [
      'https://rpc-http-pub.d-bis.org',
      'https://rpc.d-bis.org',
      'https://rpc2.d-bis.org',
      'https://rpc.public-0138.defi-oracle.io',
      'https://rpc.defi-oracle.io',
    ],
    ws: [
      'wss://rpc-ws-pub.d-bis.org',
      'wss://ws.rpc.d-bis.org',
      'wss://ws.rpc2.d-bis.org',
      'wss://rpc.public-0138.defi-oracle.io',
      'wss://wss.defi-oracle.io',
    ],
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.d-bis.org',
  },
})
