import { expect, test } from 'vitest'

import * as chains from './chains'

test('exports chains', () => {
  expect(chains).toMatchInlineSnapshot(`
    {
      "arbitrum": {
        "blockExplorers": {
          "arbitrum": {
            "name": "Arbitrum Explorer",
            "url": "https://explorer.arbitrum.io",
          },
          "default": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
          "etherscan": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
        },
        "id": 42161,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 7654707,
        },
        "name": "Arbitrum One",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "arbitrum",
        "rpcUrls": {
          "alchemy": "https://arb-mainnet.g.alchemy.com/v2",
          "default": "https://arb-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://arbitrum-mainnet.infura.io/v3",
        },
      },
      "arbitrumGoerli": {
        "blockExplorers": {
          "arbitrum": {
            "name": "Arbitrum Explorer",
            "url": "https://goerli-rollup-explorer.arbitrum.io",
          },
          "default": {
            "name": "Arbiscan",
            "url": "https://testnet.arbiscan.io",
          },
          "etherscan": {
            "name": "Arbiscan",
            "url": "https://testnet.arbiscan.io",
          },
        },
        "id": 421613,
        "name": "Arbitrum Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Arbitrum Goerli Ether",
          "symbol": "ARETH",
        },
        "network": "arbitrumGoerli",
        "rpcUrls": {
          "alchemy": "https://arb-goerli.g.alchemy.com/v2",
          "default": "https://arb-goerli.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://arbitrum-goerli.infura.io/v3",
        },
        "testnet": true,
      },
      "goerli": {
        "blockExplorers": {
          "default": {
            "name": "Etherscan",
            "url": "https://goerli.etherscan.io",
          },
          "etherscan": {
            "name": "Etherscan",
            "url": "https://goerli.etherscan.io",
          },
        },
        "ens": {
          "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        },
        "id": 5,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 6507670,
        },
        "name": "Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Goerli Ether",
          "symbol": "GOR",
        },
        "network": "goerli",
        "rpcUrls": {
          "alchemy": "https://eth-goerli.alchemyapi.io/v2",
          "default": "https://eth-goerli.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://goerli.infura.io/v3",
        },
        "testnet": true,
      },
      "local": {
        "id": 1337,
        "name": "Localhost",
        "network": "localhost",
        "rpcUrls": {
          "default": "http://127.0.0.1:8545",
          "local": "http://127.0.0.1:8545",
        },
      },
      "mainnet": {
        "blockExplorers": {
          "default": {
            "name": "Etherscan",
            "url": "https://etherscan.io",
          },
          "etherscan": {
            "name": "Etherscan",
            "url": "https://etherscan.io",
          },
        },
        "ens": {
          "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        },
        "id": 1,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 14353601,
        },
        "name": "Ethereum",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "mainnet",
        "rpcUrls": {
          "alchemy": "https://eth-mainnet.alchemyapi.io/v2",
          "default": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://mainnet.infura.io/v3",
        },
      },
      "optimism": {
        "blockExplorers": {
          "default": {
            "name": "Etherscan",
            "url": "https://optimistic.etherscan.io",
          },
          "etherscan": {
            "name": "Etherscan",
            "url": "https://optimistic.etherscan.io",
          },
        },
        "id": 10,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 4286263,
        },
        "name": "Optimism",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "optimism",
        "rpcUrls": {
          "alchemy": "https://opt-mainnet.g.alchemy.com/v2",
          "default": "https://opt-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://optimism-mainnet.infura.io/v3",
        },
      },
      "optimismGoerli": {
        "blockExplorers": {
          "blockscout": {
            "name": "Blockscout",
            "url": "https://blockscout.com/optimism/goerli",
          },
          "default": {
            "name": "Blockscout",
            "url": "https://blockscout.com/optimism/goerli",
          },
        },
        "id": 420,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 49461,
        },
        "name": "Optimism Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Goerli Ether",
          "symbol": "GOR",
        },
        "network": "optimismGoerli",
        "rpcUrls": {
          "alchemy": "https://opt-goerli.g.alchemy.com/v2",
          "default": "https://opt-goerli.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://optimism-goerli.infura.io/v3",
        },
        "testnet": true,
      },
      "polygon": {
        "blockExplorers": {
          "default": {
            "name": "PolygonScan",
            "url": "https://polygonscan.com",
          },
          "etherscan": {
            "name": "PolygonScan",
            "url": "https://polygonscan.com",
          },
        },
        "id": 137,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 25770160,
        },
        "name": "Polygon",
        "nativeCurrency": {
          "decimals": 18,
          "name": "MATIC",
          "symbol": "MATIC",
        },
        "network": "polygon",
        "rpcUrls": {
          "alchemy": "https://polygon-mainnet.g.alchemy.com/v2",
          "default": "https://polygon-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://polygon-mainnet.infura.io/v3",
        },
      },
      "polygonMumbai": {
        "blockExplorers": {
          "default": {
            "name": "PolygonScan",
            "url": "https://mumbai.polygonscan.com",
          },
          "etherscan": {
            "name": "PolygonScan",
            "url": "https://mumbai.polygonscan.com",
          },
        },
        "id": 80001,
        "multicall": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 25444704,
        },
        "name": "Polygon Mumbai",
        "nativeCurrency": {
          "decimals": 18,
          "name": "MATIC",
          "symbol": "MATIC",
        },
        "network": "polygonMumbai",
        "rpcUrls": {
          "alchemy": "https://polygon-mumbai.g.alchemy.com/v2",
          "default": "https://polygon-mumbai.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          "infura": "https://polygon-mumbai.infura.io/v3",
        },
        "testnet": true,
      },
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
