import { expect, test } from 'vitest'

import { createHttpServer } from '~test/src/utils.js'
import { createBlockFilter } from '../../actions/public/createBlockFilter.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { fallback } from '../../clients/transports/fallback.js'
import { http } from '../../clients/transports/http.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { createFilterRequestScope } from './createFilterRequestScope.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newBlockFilter',
  })
  const { id } = await createBlockFilter(client)
  expect(getRequest(id)).toEqual(client.request)
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
