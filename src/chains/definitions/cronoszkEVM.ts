import * as Chain from '../../core/Chain.js'

export const cronoszkEVM = /*#__PURE__*/ Chain.define({
  id: 388n,
  name: 'Cronos zkEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos zkEVM CRO',
    symbol: 'zkCRO',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.zkevm.cronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Cronos zkEVM (Mainnet) Chain Explorer',
      url: 'https://explorer.zkevm.cronos.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0x06f4487d7c4a5983d2660db965cc6d2565e4cfaa',
      blockCreated: 72,
    },
  },
})
