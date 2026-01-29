import { assertType, expect, test } from 'vitest'

import { usdcContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { createHttpServer } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { fallback } from '../../clients/transports/fallback.js'
import { http } from '../../clients/transports/http.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { createContractEventFilter } from './createContractEventFilter.js'

const request = (() => {}) as unknown as EIP1193RequestFn

const client = anvilMainnet.getClient()

test('default', async () => {
  const filter = await createContractEventFilter(client, {
    abi: usdcContractConfig.abi,
  })
  assertType<typeof filter>({
    abi: usdcContractConfig.abi,
    id: '0x',
    type: 'event',
    args: undefined,
    eventName: undefined,
    request,
    strict: undefined,
  })
  expect(filter.id).toBeDefined()
  expect(filter.type).toBe('event')
  expect(filter.args).toBeUndefined()
  expect(filter.eventName).toBeUndefined()
})

test('args: address', async () => {
  const filter = await createContractEventFilter(client, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
  })
  expect(filter.id).toBeDefined()
})

test('args: args', async () => {
  const filter = await createContractEventFilter(client, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      from: accounts[0].address,
      to: accounts[0].address,
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter.args).toEqual({
    from: accounts[0].address,
    to: accounts[0].address,
  })
  expect(filter.eventName).toEqual('Transfer')

  const filter2 = await createContractEventFilter(client, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      from: accounts[0].address,
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter2.args).toEqual({
    from: accounts[0].address,
  })
  expect(filter.eventName).toEqual('Transfer')

  const filter3 = await createContractEventFilter(client, {
    address: usdcContractConfig.address,
    abi: usdcContractConfig.abi,
    eventName: 'Transfer',
    args: {
      to: [accounts[0].address, accounts[1].address],
    },
  })
  expect(filter.abi).toEqual(usdcContractConfig.abi)
  expect(filter3.args).toEqual({
    to: [accounts[0].address, accounts[1].address],
  })
  expect(filter3.eventName).toEqual('Transfer')
})

test('args: fromBlock', async () => {
  expect(
    (
      await createContractEventFilter(client, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        fromBlock: 'latest',
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(client, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        fromBlock: anvilMainnet.forkBlockNumber,
      })
    ).id,
  ).toBeDefined()
})

test('args: toBlock', async () => {
  expect(
    (
      await createContractEventFilter(client, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        toBlock: 'latest',
      })
    ).id,
  ).toBeDefined()
  expect(
    (
      await createContractEventFilter(client, {
        address: usdcContractConfig.address,
        abi: usdcContractConfig.abi,
        eventName: 'Transfer',
        toBlock: anvilMainnet.forkBlockNumber,
      })
    ).id,
  ).toBeDefined()
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
  const filter = await createContractEventFilter(fallbackClient, {
    abi: usdcContractConfig.abi,
  })
  expect(filter).toBeDefined()
  expect(count1).toBe(1)
  expect(count2).toBe(1)

  await filter.request({ method: 'eth_getFilterChanges', params: [filter.id] })
  expect(count1).toBe(1)
  expect(count2).toBe(2)
})
