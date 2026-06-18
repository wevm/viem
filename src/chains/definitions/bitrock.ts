import * as Chain from '../../core/Chain.js'

export const bitrock = /*#__PURE__*/ Chain.from({
  id: 7171,
  name: 'Bitrock Mainnet',
  nativeCurrency: { name: 'BROCK', symbol: 'BROCK', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://brockrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitrock Explorer',
      url: 'https://explorer.bit-rock.io',
    },
  },
  testnet: false,
})
