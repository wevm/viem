import { expect, test } from 'vitest'
import { createFilterRequestScope } from './createFilterRequestScope.js'
import {
  createHttpServer,
  publicClient,
  setupAnvil,
} from '../../_test/index.js'
import { createBlockFilter } from '../../public.js'
import { createPublicClient, fallback, http } from '../../clients/index.js'

setupAnvil()

test('default', async () => {
  const getRequest = createFilterRequestScope(publicClient, {
    method: 'eth_newBlockFilter',
  })
  const { id } = await createBlockFilter(publicClient)
  expect(getRequest(id)).toEqual(publicClient.request)
})

test('fallback transport', async () => {
  const server1 = await createHttpServer((_req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    res.end(
      JSON.stringify({
        error: { code: -32004, message: 'method not supported' },
      }),
    )
  })

  let count = 0
  const server2 = await createHttpServer((_req, res) => {
    count++
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    res.end(JSON.stringify({ result: '0x1' }))
  })

  const fallbackClient = createPublicClient({
    transport: fallback([http(server1.url), http(server2.url)]),
  })
  const getRequest = createFilterRequestScope(fallbackClient, {
    method: 'eth_newBlockFilter',
  })
  const { id } = await createBlockFilter(fallbackClient)

  const request = getRequest(id)
  count = 0
  await request({ method: 'eth_getFilterChanges', params: [id] })
  expect(count).toBe(1)
})
