import { defineChain } from '../../utils/chain/defineChain.js'

export const berachainTestnet = /*#__PURE__*/ defineChain({
  id: 80085,
  name: 'Berachain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBera Coin',
    symbol: 'tBERA',
  },
  rpcUrls: {
    default: { http: ['https://artio.rpc.berachain.com/'] },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://artio.beratrail.io',
      apiUrl: 'https://api.routescan.io/v2/network/testnet/evm/80085/etherscan',
    },
  },
  contracts: {
    multicall3: {
      address: '0x9d1dB8253105b007DDDE65Ce262f701814B91125',
      blockCreated: 1,
    },
  },
  testnet: true,
})
