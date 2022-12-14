import { describe, expect, test } from 'vitest'

import * as chains from './chains'

test('exports chains', () => {
  expect(chains).toMatchInlineSnapshot(`
    {
      "arbitrum": {
        "blockExplorers": {
          "default": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
          "etherscan": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 7654707,
          },
        },
        "id": 42161,
        "name": "Arbitrum One",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "arbitrum",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://arb-mainnet.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://arb-mainnet.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://arb1.arbitrum.io/rpc",
            ],
          },
          "infura": {
            "http": [
              "https://arbitrum-mainnet.infura.io/v3",
            ],
            "webSocket": [
              "wss://arbitrum-mainnet.infura.io/ws/v3",
            ],
          },
        },
      },
      "arbitrumGoerli": {
        "blockExplorers": {
          "default": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
          "etherscan": {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 7654707,
          },
        },
        "id": 421613,
        "name": "Arbitrum Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Arbitrum Goerli Ether",
          "symbol": "ETH",
        },
        "network": "arbitrum-goerli",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://arb-goerli.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://arb-goerli.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://arb1.arbitrum.io/rpc",
            ],
          },
          "infura": {
            "http": [
              "https://arbitrum-goerli.infura.io/v3",
            ],
            "webSocket": [
              "wss://arbitrum-goerli.infura.io/ws/v3",
            ],
          },
        },
        "testnet": true,
      },
      "avalanche": {
        "blockExplorers": {
          "default": {
            "name": "SnowTrace",
            "url": "https://snowtrace.io",
          },
          "etherscan": {
            "name": "SnowTrace",
            "url": "https://snowtrace.io",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 11907934,
          },
        },
        "id": 43114,
        "name": "Avalanche",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Avalanche",
          "symbol": "AVAX",
        },
        "network": "avalanche",
        "rpcUrls": {
          "default": {
            "http": [
              "https://api.avax.network/ext/bc/C/rpc",
            ],
          },
        },
      },
      "avalancheFuji": {
        "blockExplorers": {
          "default": {
            "name": "SnowTrace",
            "url": "https://testnet.snowtrace.io",
          },
          "etherscan": {
            "name": "SnowTrace",
            "url": "https://testnet.snowtrace.io",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 7096959,
          },
        },
        "id": 43113,
        "name": "Avalanche Fuji",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Avalanche Fuji",
          "symbol": "AVAX",
        },
        "network": "avalanche-fuji",
        "rpcUrls": {
          "default": {
            "http": [
              "https://api.avax-test.network/ext/bc/C/rpc",
            ],
          },
        },
        "testnet": true,
      },
      "bsc": {
        "blockExplorers": {
          "default": {
            "name": "BscScan",
            "url": "https://bscscan.com",
          },
          "etherscan": {
            "name": "BscScan",
            "url": "https://bscscan.com",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 15921452,
          },
        },
        "id": 56,
        "name": "Binance Smart Chain",
        "nativeCurrency": {
          "decimals": 18,
          "name": "BNB",
          "symbol": "BNB",
        },
        "network": "bsc",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.ankr.com/bsc",
            ],
          },
        },
      },
      "bscTestnet": {
        "blockExplorers": {
          "default": {
            "name": "BscScan",
            "url": "https://testnet.bscscan.com",
          },
          "etherscan": {
            "name": "BscScan",
            "url": "https://testnet.bscscan.com",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 17422483,
          },
        },
        "id": 97,
        "name": "Binance Smart Chain Testnet",
        "nativeCurrency": {
          "decimals": 18,
          "name": "BNB",
          "symbol": "tBNB",
        },
        "network": "bsc-testnet",
        "rpcUrls": {
          "default": {
            "http": [
              "https://bsctestapi.terminet.io/rpc",
            ],
          },
        },
        "testnet": true,
      },
      "celo": {
        "formatters": {
          "block": {
            "difficulty": [Function],
            "gasLimit": [Function],
            "mixHash": [Function],
            "nonce": [Function],
            "randomness": [Function],
            "uncles": [Function],
          },
          "transaction": {
            "feeCurrency": [Function],
            "gatewayFee": [Function],
            "gatewayFeeRecipient": [Function],
          },
          "transactionRequest": {
            "feeCurrency": [Function],
            "gatewayFee": [Function],
            "gatewayFeeRecipient": [Function],
          },
        },
        "id": 42220,
        "name": "Celo",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Celo",
          "symbol": "CELO",
        },
        "network": "celo",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.ankr.com/celo",
            ],
          },
        },
      },
      "defineChain": [Function],
      "fantom": {
        "blockExplorers": {
          "default": {
            "name": "FTMScan",
            "url": "https://ftmscan.com",
          },
          "etherscan": {
            "name": "FTMScan",
            "url": "https://ftmscan.com",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 33001987,
          },
        },
        "id": 250,
        "name": "Fantom",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Fantom",
          "symbol": "FTM",
        },
        "network": "fantom",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.ankr.com/fantom",
            ],
          },
        },
      },
      "fantomTestnet": {
        "blockExplorers": {
          "default": {
            "name": "FTMScan",
            "url": "https://testnet.ftmscan.com",
          },
          "etherscan": {
            "name": "FTMScan",
            "url": "https://testnet.ftmscan.com",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 8328688,
          },
        },
        "id": 250,
        "name": "Fantom Testnet",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Fantom",
          "symbol": "FTM",
        },
        "network": "fantom-testnet",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.testnet.fantom.network",
            ],
          },
        },
      },
      "foundry": {
        "id": 31337,
        "name": "Foundry",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "foundry",
        "rpcUrls": {
          "default": {
            "http": [
              "http://127.0.0.1:8545",
            ],
          },
        },
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
        "contracts": {
          "ensRegistry": {
            "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          },
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 6507670,
          },
        },
        "id": 5,
        "name": "Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Goerli Ether",
          "symbol": "GOR",
        },
        "network": "goerli",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://eth-goerli.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://eth-goerli.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://rpc.ankr.com/eth_goerli",
            ],
          },
          "infura": {
            "http": [
              "https://goerli.infura.io/v3",
            ],
            "webSocket": [
              "wss://goerli.infura.io/ws/v3",
            ],
          },
        },
        "testnet": true,
      },
      "hardhat": {
        "id": 31337,
        "name": "Hardhat",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "hardhat",
        "rpcUrls": {
          "default": {
            "http": [
              "http://127.0.0.1:8545",
            ],
          },
        },
      },
      "localhost": {
        "id": 1337,
        "name": "Localhost",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "localhost",
        "rpcUrls": {
          "default": {
            "http": [
              "http://127.0.0.1:8545",
            ],
          },
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
        "contracts": {
          "ensRegistry": {
            "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          },
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 14353601,
          },
        },
        "id": 1,
        "name": "Ethereum",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "homestead",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://eth-mainnet.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://eth-mainnet.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://cloudflare-eth.com",
            ],
          },
          "infura": {
            "http": [
              "https://mainnet.infura.io/v3",
            ],
            "webSocket": [
              "wss://mainnet.infura.io/ws/v3",
            ],
          },
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
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 4286263,
          },
        },
        "id": 10,
        "name": "Optimism",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "network": "optimism",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://opt-mainnet.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://opt-mainnet.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://mainnet.optimism.io",
            ],
          },
          "infura": {
            "http": [
              "https://optimism-mainnet.infura.io/v3",
            ],
            "webSocket": [
              "wss://optimism-mainnet.infura.io/ws/v3",
            ],
          },
        },
      },
      "optimismGoerli": {
        "blockExplorers": {
          "default": {
            "name": "Etherscan",
            "url": "https://goerli-optimism.etherscan.io",
          },
          "etherscan": {
            "name": "Etherscan",
            "url": "https://goerli-optimism.etherscan.io",
          },
        },
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 49461,
          },
        },
        "id": 420,
        "name": "Optimism Goerli",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Goerli Ether",
          "symbol": "ETH",
        },
        "network": "optimism-goerli",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://opt-goerli.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://opt-goerli.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://goerli.optimism.io",
            ],
          },
          "infura": {
            "http": [
              "https://optimism-goerli.infura.io/v3",
            ],
            "webSocket": [
              "wss://optimism-goerli.infura.io/ws/v3",
            ],
          },
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
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 25770160,
          },
        },
        "id": 137,
        "name": "Polygon",
        "nativeCurrency": {
          "decimals": 18,
          "name": "MATIC",
          "symbol": "MATIC",
        },
        "network": "matic",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://polygon-mainnet.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://polygon-mainnet.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://polygon-rpc.com",
            ],
          },
          "infura": {
            "http": [
              "https://polygon-mainnet.infura.io/v3",
            ],
            "webSocket": [
              "wss://polygon-mainnet.infura.io/ws/v3",
            ],
          },
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
        "contracts": {
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 25770160,
          },
        },
        "id": 80001,
        "name": "Polygon Mumbai",
        "nativeCurrency": {
          "decimals": 18,
          "name": "MATIC",
          "symbol": "MATIC",
        },
        "network": "maticmum",
        "rpcUrls": {
          "alchemy": {
            "http": [
              "https://polygon-mumbai.g.alchemy.com/v2",
            ],
            "webSocket": [
              "wss://polygon-mumbai.g.alchemy.com/v2",
            ],
          },
          "default": {
            "http": [
              "https://matic-mumbai.chainstacklabs.com",
            ],
          },
          "infura": {
            "http": [
              "https://polygon-mumbai.infura.io/v3",
            ],
            "webSocket": [
              "wss://polygon-mumbai.infura.io/ws/v3",
            ],
          },
        },
        "testnet": true,
      },
      "sepolia": {
        "blockExplorers": {
          "default": {
            "name": "Etherscan",
            "url": "https://sepolia.etherscan.io",
          },
          "etherscan": {
            "name": "Etherscan",
            "url": "https://sepolia.etherscan.io",
          },
        },
        "contracts": {
          "ensRegistry": {
            "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          },
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 6507670,
          },
        },
        "id": 11155111,
        "name": "Sepolia",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Sepolia Ether",
          "symbol": "SEP",
        },
        "network": "sepolia",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.sepolia.org",
            ],
          },
          "infura": {
            "http": [
              "https://sepolia.infura.io/v3",
            ],
            "webSocket": [
              "wss://sepolia.infura.io/ws/v3",
            ],
          },
        },
        "testnet": true,
      },
    }
  `)
})

describe('defineChain', () => {
  test('default', () => {
    expect(
      chains.defineChain({
        id: 42220,
        name: 'Celo',
        network: 'celo',
        nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://rpc.ankr.com/celo'] },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 42220,
        "name": "Celo",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Celo",
          "symbol": "CELO",
        },
        "network": "celo",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.ankr.com/celo",
            ],
          },
        },
      }
    `)
  })

  test('args: formatters', () => {
    const { block, transaction, transactionRequest } = chains.celo.formatters!

    expect(
      block.randomness({
        randomness: { committed: '0x0', revealed: '0x0' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "committed": "0x0",
        "revealed": "0x0",
      }
    `)
    expect(block.difficulty()).toBeUndefined()
    expect(block.gasLimit()).toBeUndefined()
    expect(block.mixHash()).toBeUndefined()
    expect(block.nonce()).toBeUndefined()
    expect(block.uncles()).toBeUndefined()

    expect(
      transaction.feeCurrency({ feeCurrency: '0x1' }),
    ).toMatchInlineSnapshot('"0x1"')
    expect(transaction.gatewayFee({ gatewayFee: '0x1' })).toMatchInlineSnapshot(
      '1n',
    )
    expect(transaction.gatewayFee({ gatewayFee: null })).toMatchInlineSnapshot(
      'null',
    )
    expect(
      transaction.gatewayFeeRecipient({
        gatewayFeeRecipient: '0x1',
      }),
    ).toMatchInlineSnapshot('"0x1"')

    expect(
      transactionRequest.feeCurrency({ feeCurrency: '0x1' }),
    ).toMatchInlineSnapshot('"0x1"')
    expect(
      transactionRequest.gatewayFee({ gatewayFee: '0x1' }),
    ).toMatchInlineSnapshot('1n')
    expect(
      transactionRequest.gatewayFee({ gatewayFee: null }),
    ).toMatchInlineSnapshot('null')
    expect(
      transactionRequest.gatewayFeeRecipient({
        gatewayFeeRecipient: '0x1',
      }),
    ).toMatchInlineSnapshot('"0x1"')
  })
})
