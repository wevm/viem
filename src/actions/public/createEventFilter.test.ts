import { assertType, describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { createHttpServer } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { fallback } from '../../clients/transports/fallback.js'
import { http } from '../../clients/transports/http.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { createEventFilter } from './createEventFilter.js'

const client = anvilMainnet.getClient()

const event = {
  default: {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  approve: {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  unnamed: {
    inputs: [
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: true,
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
} as const

const request = (() => {}) as unknown as EIP1193RequestFn

describe('default', () => {
  test('no args', async () => {
    const filter = await createEventFilter(client)
    assertType<typeof filter>({
      id: '0x',
      request,
      type: 'event',
    })
    expect(filter.id).toBeDefined()
    expect(filter.type).toBe('event')
    expect(filter.args).toBeUndefined()
    expect(filter.abi).toBeUndefined()
    expect(filter.eventName).toBeUndefined()
  })

  test('args: address', async () => {
    await createEventFilter(client, {
      address: accounts[0].address,
    })
  })

  test('args: event', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
    })
    assertType<typeof filter>({
      abi: [event.default],
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter.args).toBeUndefined()
    expect(filter.abi).toEqual([event.default])
    expect(filter.eventName).toEqual('Transfer')
  })

  test('args: events', async () => {
    const filter = await createEventFilter(client, {
      events: [event.default, event.approve],
    })
    assertType<typeof filter>({
      abi: [event.default, event.approve],
      eventName: undefined,
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter.args).toBeUndefined()
    expect(filter.abi).toEqual([event.default, event.approve])
    expect(filter.eventName).toBeUndefined()
  })

  test('args: args (named)', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
      args: {
        from: accounts[0].address,
        to: accounts[0].address,
      },
    })
    assertType<typeof filter>({
      abi: [event.default],
      args: {
        from: accounts[0].address,
        to: accounts[0].address,
      },
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter.args).toEqual({
      from: accounts[0].address,
      to: accounts[0].address,
    })
    expect(filter.abi).toEqual([event.default])
    expect(filter.eventName).toEqual('Transfer')

    const filter2 = await createEventFilter(client, {
      event: event.default,
      args: {
        from: accounts[0].address,
      },
    })
    assertType<typeof filter2>({
      abi: [event.default],
      args: {
        from: accounts[0].address,
      },
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter2.args).toEqual({
      from: accounts[0].address,
    })
    expect(filter2.abi).toEqual([event.default])
    expect(filter2.eventName).toEqual('Transfer')

    const filter3 = await createEventFilter(client, {
      event: event.default,
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    assertType<typeof filter3>({
      abi: [event.default],
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter3.args).toEqual({
      to: [accounts[0].address, accounts[1].address],
    })
    expect(filter3.abi).toEqual([event.default])
    expect(filter3.eventName).toEqual('Transfer')
  })

  test('args: args (unnamed)', async () => {
    const filter1 = await createEventFilter(client, {
      event: event.unnamed,
      args: [accounts[0].address, accounts[1].address],
    })
    assertType<typeof filter1>({
      abi: [event.unnamed],
      args: [accounts[0].address, accounts[1].address],
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter1.args).toEqual([accounts[0].address, accounts[1].address])
    expect(filter1.abi).toEqual([event.unnamed])
    expect(filter1.eventName).toEqual('Transfer')

    const filter2 = await createEventFilter(client, {
      event: event.unnamed,
      args: [[accounts[0].address, accounts[1].address]],
    })
    assertType<typeof filter2>({
      abi: [event.unnamed],
      args: [[accounts[0].address, accounts[1].address]],
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter2.args).toEqual([[accounts[0].address, accounts[1].address]])
    expect(filter2.abi).toEqual([event.unnamed])
    expect(filter2.eventName).toEqual('Transfer')

    const filter3 = await createEventFilter(client, {
      event: event.unnamed,
      args: [null, accounts[0].address],
    })
    assertType<typeof filter3>({
      abi: [event.unnamed],
      args: [null, accounts[0].address],
      eventName: 'Transfer',
      id: '0x',
      request,
      strict: undefined,
      type: 'event',
    })
    expect(filter3.args).toEqual([null, accounts[0].address])
    expect(filter3.abi).toEqual([event.unnamed])
    expect(filter3.eventName).toEqual('Transfer')
  })

  test('args: fromBlock', async () => {
    await createEventFilter(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber,
    })
    await createEventFilter(client, {
      event: event.default,
      fromBlock: 'latest',
    })
  })

  test('args: toBlock', async () => {
    await createEventFilter(client, {
      event: event.default,
      toBlock: anvilMainnet.forkBlockNumber,
    })
    await createEventFilter(client, {
      event: event.default,
      toBlock: 'latest',
    })
  })
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
  const filter = await createEventFilter(fallbackClient)
  expect(filter).toBeDefined()
  expect(count1).toBe(1)
  expect(count2).toBe(1)

  await filter.request({ method: 'eth_getFilterChanges', params: [filter.id] })
  expect(count1).toBe(1)
  expect(count2).toBe(2)
})
