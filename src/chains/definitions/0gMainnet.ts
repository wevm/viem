import * as Chain from '../../core/Chain.js'

export const zeroGMainnet = /*#__PURE__*/ Chain.from({
  id: 16_661,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    http: 'https://evmrpc.0g.ai',
  },
  blockExplorers: {
    name: '0G BlockChain Explorer',
    url: 'https://chainscan.0g.ai',
  },
  testnet: false,
})
