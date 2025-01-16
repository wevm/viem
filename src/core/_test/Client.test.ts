import { Client } from 'viem'
import { describe, expect, test } from 'vitest'

describe('from', () => {
  test('default', () => {
    const client = Client.from({ chain: 'TODO', transport: 'TODO' })
    expect({ ...client, uid: null }).toMatchInlineSnapshot(`
      {
        "cacheTime": 4000,
        "chain": "TODO",
        "extend": [Function],
        "pollingInterval": 4000,
        "request": undefined,
        "transport": "TODO",
        "uid": null,
      }
    `)
  })
})
