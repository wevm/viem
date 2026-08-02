import * as Token from '../../core/Token.js'

/**
 * [EURC](https://www.circle.com/eurc) token, with canonical contract addresses
 * across supported EVM chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * token config, or read the metadata and `addresses`
 * map directly.
 */
export const eurc = /*#__PURE__*/ Token.from({
  addresses: {
    1: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', // mainnet
    25: '0xA6dE01a2d62C6B5f3525d768f34d276652C554c8', // cronos
    338: '0x31f7538adb53cF16350e6B0c89d03D91b7D12c46', // cronosTestnet
    480: '0x1C60ba0A0eD1019e8Eb035E6daF4155A5cE2380B', // worldchain
    4801: '0xe479EcA5740Ac65d6E1823bea2f1C08Bc14e954F', // worldchainSepolia
    8453: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', // base
    43113: '0x5E44db7996c682E92a960b65AC713a54AD815c6B', // avalancheFuji
    43114: '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD', // avalanche
    84532: '0x808456652fdb597867f38412077A9182bf77359F', // baseSepolia
    5042002: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', // arcTestnet
    11155111: '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4', // sepolia
  },
  currency: 'EUR',
  decimals: 6,
  name: 'EURC',
  symbol: 'EURC',
})
