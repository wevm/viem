import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const bitlayerTestnet = /*#__PURE__*/ Chain.from({
  id: 200810,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet-rpc.bitlayer.org',
    ws: 'wss://testnet-ws.bitlayer.org',
  },
  blockExplorers: {
    name: 'bitlayer testnet scan',
    url: 'https://testnet.btrscan.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x5B256fE9e993902eCe49D138a5b1162cBb529474',
      blockCreated: 4135671,
    },
  },
  testnet: true,
})
