import * as Chain from '../../core/Chain.js'

export const cronoszkEVM = /*#__PURE__*/ Chain.from({
  id: 388,
  name: 'Cronos zkEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos zkEVM CRO',
    symbol: 'zkCRO',
  },
  rpcUrls: { http: 'https://mainnet.zkevm.cronos.org' },
  blockExplorers: {
    name: 'Cronos zkEVM (Mainnet) Chain Explorer',
    url: 'https://explorer.zkevm.cronos.org',
  },
  contracts: {
    multicall3: {
      address: '0x06f4487d7c4a5983d2660db965cc6d2565e4cfaa',
      blockCreated: 72,
    },
  },
})
