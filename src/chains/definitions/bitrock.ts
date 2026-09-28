import * as Chain from '../../core/Chain.js'

export const bitrock = /*#__PURE__*/ Chain.from({
  id: 7171,
  name: 'Bitrock Mainnet',
  nativeCurrency: { name: 'BROCK', symbol: 'BROCK', decimals: 18 },
  rpcUrls: {
    http: 'https://brockrpc.io',
  },
  blockExplorers: {
    name: 'Bitrock Explorer',
    url: 'https://explorer.bit-rock.io',
  },
  testnet: false,
})
