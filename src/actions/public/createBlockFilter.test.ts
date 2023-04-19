import { expect, test } from 'vitest'

import { createHttpServer, publicClient } from '../../_test/index.js'

import { createBlockFilter } from './createBlockFilter.js'
import { createPublicClient, fallback, http } from '../../clients/index.js'

test('default', async () => {
  expect(await createBlockFilter(publicClient)).toBeDefined()
})

test('fallback client: scopes request', async () => {
  let count1 = 0
  const server1 = await createHttpServer((_req, res) => {
    count1++
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    res.end(
      JSON.stringify({
        error: { code: -32004, message: 'method not supported' },
      }),
    )
  })

  let count2 = 0
  const server2 = await createHttpServer((_req, res) => {
    count2++
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    res.end(JSON.stringify({ result: '0x1' }))
  })

  const fallbackClient = createPublicClient({
    transport: fallback([http(server1.url), http(server2.url)]),
  })
  const filter = await createBlockFilter(fallbackClient)
  expect(filter).toBeDefined()
  expect(count1).toBe(1)
  expect(count2).toBe(1)

  await filter.request({ method: 'eth_getFilterChanges', params: [filter.id] })
  expect(count1).toBe(1)
  expect(count2).toBe(2)
})
