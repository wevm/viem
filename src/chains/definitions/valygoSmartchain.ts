import { defineChain } from '../../utils/chain/defineChain.js'

export const valygoSmartchain = defineChain({
  id: 7_771_777,
  name: 'VALYGO Smartchain',
  nativeCurrency: {
    decimals: 18,
    name: 'VYO',
    symbol: 'VYO',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-gw-1.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc',
        'https://rpc-gw-2.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc',
      ],
      webSocket: [
        'wss://ws.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/ws',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'VYOScan',
      url: 'https://vyoscan.com',
      apiUrl: 'https://vyoscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xeFa3c632BD275750597cE9ca2346A5becAA0F344',
    },
  },
})
