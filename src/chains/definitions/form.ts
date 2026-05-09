import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const form = /*#__PURE__*/ defineChain({
  id: 478,
  name: 'Form Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.form.network/http'],
      webSocket: ['wss://rpc.form.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Form Explorer',
      url: 'https://explorer.form.network',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    addressManager: {
      [sourceId]: {
        address: '0x15c249E46A2F924C2dB3A1560CF86729bAD1f07B',
      },
    },
    l1CrossDomainMessenger: {
      [sourceId]: {
        address: '0xF333158DCCad1dF6C3F0a3aEe8BC31fA94d9eD5c',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x4ccAAF69F41c5810cA875183648B577CaCf1F67E',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x4E259Ee5F4136408908160dD32295A5031Fa426F',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xdc20aA63D3DE59574E065957190D8f24e0F7B8Ba',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  sourceId,
})
