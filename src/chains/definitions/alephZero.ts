import * as Chain from '../../core/Chain.js'

export const alephZero = /*#__PURE__*/ Chain.define({
  id: 41_455n,
  name: 'Aleph Zero',
  nativeCurrency: { name: 'Aleph Zero', symbol: 'AZERO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.alephzero.raas.gelato.cloud'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Aleph Zero EVM Explorer',
      url: 'https://evm-explorer.alephzero.org',
      apiUrl: 'https://evm-explorer.alephzero.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4603377,
    },
  },
})
