import { tempo, tempoModerato } from 'viem/chains'
import { expect, test } from 'vitest'

test.each([tempo, tempoModerato])(
  '$name exposes canonical Earn factory addresses',
  (chain) => {
    expect(chain.contracts).toMatchInlineSnapshot(`
      {
        "earnFactory": {
          "address": "0xb5889A96114014d4C032ebD76772c10bF3b97137",
        },
        "erc4626EngineFactory": {
          "address": "0xd43D00981222a8db444A528E69f19E3cE5A7D2Ff",
        },
      }
    `)
  },
)
