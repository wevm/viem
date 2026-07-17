import * as Chain from '../../core/Chain.js'

export const xdcTestnet = /*#__PURE__*/ Chain.from({
  id: 51,
  name: 'Apothem Network',
  nativeCurrency: {
    decimals: 18,
    name: 'TXDC',
    symbol: 'TXDC',
  },
  rpcUrls: { http: 'https://erpc.apothem.network' },
  blockExplorers: {
    name: 'XDCScan',
    url: 'https://testnet.xdcscan.com',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 59765389,
    },
  },
  testnet: true,
})
