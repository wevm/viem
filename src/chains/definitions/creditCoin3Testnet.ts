import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3Testnet = /*#__PURE__*/ defineChain({
  id: 102031,
  name: 'Creditcoin Testnet',
  nativeCurrency: { name: 'Creditcoin Testnet', symbol: 'tCTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.cc3-testnet.creditcoin.network'],
      webSocket: ['wss://rpc.cc3-testnet.creditcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://creditcoin-testnet.blockscout.com',
      apiUrl: 'https://creditcoin-testnet.blockscout.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xC78dA4A773fF9B94Fff3540ea16e4713C8AAa94a',
      blockCreated: 5_545_889,
    },
  },
  testnet: true,
})
