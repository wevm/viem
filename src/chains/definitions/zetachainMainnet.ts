import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachainMainnet = /*#__PURE__*/ defineChain({
    id: 7000,
    name: 'ZetaChain',
    network: 'ZetaChain Mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Zeta',
        symbol: 'ZETA'
    },
    rpcUrls: {
        default: {
            http: ['https://zetachain-evm.blockpi.network/v1/rpc/public']
        }
    },
    blockExplorers: {
        default: {
            name: 'ZetaScan',
            url: 'https://explorer.zetachain.com'
        }
    },
    testnet: false
});