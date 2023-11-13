import { expect, test } from 'vitest'

import * as chains from '../../chains/index.js'
import { extractChain } from './extractChain.js'

test('default', async () => {
  const mainnet = extractChain({
    chains: Object.values(chains),
    id: 1,
  })
  expect(mainnet).toMatchInlineSnapshot(`
    {
      "blockExplorers": {
        "default": {
          "name": "Etherscan",
          "url": "https://etherscan.io",
        },
      },
      "contracts": {
        "ensRegistry": {
          "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        },
        "ensUniversalResolver": {
          "address": "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62",
          "blockCreated": 16966585,
        },
        "multicall3": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 14353601,
        },
      },
      "fees": undefined,
      "formatters": undefined,
      "id": 1,
      "name": "Ethereum",
      "nativeCurrency": {
        "decimals": 18,
        "name": "Ether",
        "symbol": "ETH",
      },
      "rpcUrls": {
        "default": {
          "http": [
            "https://cloudflare-eth.com",
          ],
        },
      },
      "serializers": undefined,
    }
  `)

  const optimism = extractChain({
    chains: Object.values(chains),
    id: 10,
  })
  expect(optimism).toMatchInlineSnapshot(`
    {
      "blockExplorers": {
        "default": {
          "name": "Optimism Explorer",
          "url": "https://explorer.optimism.io",
        },
      },
      "contracts": {
        "gasPriceOracle": {
          "address": "0x420000000000000000000000000000000000000F",
        },
        "l1Block": {
          "address": "0x4200000000000000000000000000000000000015",
        },
        "l2CrossDomainMessenger": {
          "address": "0x4200000000000000000000000000000000000007",
        },
        "l2Erc721Bridge": {
          "address": "0x4200000000000000000000000000000000000014",
        },
        "l2StandardBridge": {
          "address": "0x4200000000000000000000000000000000000010",
        },
        "l2ToL1MessagePasser": {
          "address": "0x4200000000000000000000000000000000000016",
        },
        "multicall3": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 4286263,
        },
        "portal": {
          "1": {
            "address": "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed",
          },
        },
      },
      "fees": undefined,
      "formatters": {
        "block": {
          "exclude": undefined,
          "format": [Function],
          "type": "block",
        },
        "transaction": {
          "exclude": undefined,
          "format": [Function],
          "type": "transaction",
        },
        "transactionReceipt": {
          "exclude": undefined,
          "format": [Function],
          "type": "transactionReceipt",
        },
      },
      "id": 10,
      "name": "OP Mainnet",
      "nativeCurrency": {
        "decimals": 18,
        "name": "Ether",
        "symbol": "ETH",
      },
      "rpcUrls": {
        "default": {
          "http": [
            "https://mainnet.optimism.io",
          ],
        },
      },
      "serializers": undefined,
      "sourceId": 1,
    }
  `)
})
