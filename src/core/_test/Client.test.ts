import { Client, Transport } from 'viem'
import { describe, expect, test } from 'vitest'

describe('from', () => {
  test('default', async () => {
    const client = Client.from({
      chain: 'TODO',
      transport: Transport.http('https://1.rpc.thirdweb.com'),
    })
    expect({ ...client, uid: null }).toMatchInlineSnapshot(`
      {
        "cacheTime": 4000,
        "chain": "TODO",
        "extend": [Function],
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "https://1.rpc.thirdweb.com",
        },
        "uid": null,
      }
    `)
  })
})
