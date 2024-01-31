import { defineChain } from '../../utils/chain/defineChain.js'

export const hedera = /*#__PURE__*/ defineChain({
    id: 0x127,
    name: 'Hedera Mainnet',
    network: 'hedera-mainnet',
    nativeCurrency: {
        symbol: 'ℏ',
        name: 'HBAR',
        decimals:  18,
    },
    rpcUrls: {
        default: {
            http: ['https://mainnet.hashio.io/api'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Hashscan',
            url: 'https://hashscan.io/mainnet'
        },
    },
    testnet: false,
})
