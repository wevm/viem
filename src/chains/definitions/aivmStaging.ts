import { defineChain } from '../../utils/chain/defineChain.js'

export const aivm = defineChain({
  id: 262144,
  caipNetworkId: `eip155:262144`,
  chainNamespace: 'eip155',
  name: 'AIVM Staging',
  nativeCurrency: {
    decimals: 18,
    name: 'AIVM',
    symbol: 'AIVM'
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.staging.aivm.io']
    },
    public: {
      http: ['https://json-rpc.staging.aivm.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'AIVM Staging Explorer',
      url: 'https://staging-explorer.staging.aivm.io'
    }
    }
  })
  