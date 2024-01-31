import { defineChain } from '../../utils/chain/defineChain.js'

export const hederaPreviewnet = /*#__PURE__*/ defineChain({
    id: 0x129,
    name: 'Hedera Previewnet',
    network: 'hedera-previewnet',
    nativeCurrency: {
        symbol: 'ℏ',
        name: 'pHBAR',
        decimals:  18,
    },
    rpcUrls: {
        default: {
            http: ['https://previewnet.hashio.io/api'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Hashscan',
            url: 'https://hashscan.io/previewnet'
        },
    },
    testnet: true,
})
