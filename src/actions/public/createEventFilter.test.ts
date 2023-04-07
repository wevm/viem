import { assertType, describe, expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
} from '../../_test/index.js'
import { createEventFilter } from './createEventFilter.js'

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

describe('default', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)
    assertType<typeof filter>({
      id: '0x',
      type: 'event',
    })
    expect(filter.id).toBeDefined()
    expect(filter.type).toBe('event')
    expect(filter.args).toBeUndefined()
    expect(filter.abi).toBeUndefined()
    expect(filter.eventName).toBeUndefined()
  })

  test('args: address', async () => {
    await createEventFilter(publicClient, {
      address: accounts[0].address,
    })
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
    })
    assertType<typeof filter>({
      abi: [event.default],
      eventName: 'Transfer',
      id: '0x',
      type: 'event',
    })
    expect(filter.args).toBeUndefined()
    expect(filter.abi).toEqual([event.default])
    expect(filter.eventName).toEqual('Transfer')
  })

  test('args: args (named)', async () => {
    const filter = await createEventFilter(publicClient, {
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
      type: 'event',
    })
    expect(filter.args).toEqual({
      from: accounts[0].address,
      to: accounts[0].address,
    })
    expect(filter.abi).toEqual([event.default])
    expect(filter.eventName).toEqual('Transfer')

    const filter2 = await createEventFilter(publicClient, {
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
      type: 'event',
    })
    expect(filter2.args).toEqual({
      from: accounts[0].address,
    })
    expect(filter2.abi).toEqual([event.default])
    expect(filter2.eventName).toEqual('Transfer')

    const filter3 = await createEventFilter(publicClient, {
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
      type: 'event',
    })
    expect(filter3.args).toEqual({
      to: [accounts[0].address, accounts[1].address],
    })
    expect(filter3.abi).toEqual([event.default])
    expect(filter3.eventName).toEqual('Transfer')
  })

  test('args: args (unnamed)', async () => {
    const filter1 = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [accounts[0].address, accounts[1].address],
    })
    assertType<typeof filter1>({
      abi: [event.unnamed],
      args: [accounts[0].address, accounts[1].address],
      eventName: 'Transfer',
      id: '0x',
      type: 'event',
    })
    expect(filter1.args).toEqual([accounts[0].address, accounts[1].address])
    expect(filter1.abi).toEqual([event.unnamed])
    expect(filter1.eventName).toEqual('Transfer')

    const filter2 = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [[accounts[0].address, accounts[1].address]],
    })
    assertType<typeof filter2>({
      abi: [event.unnamed],
      args: [[accounts[0].address, accounts[1].address]],
      eventName: 'Transfer',
      id: '0x',
      type: 'event',
    })
    expect(filter2.args).toEqual([[accounts[0].address, accounts[1].address]])
    expect(filter2.abi).toEqual([event.unnamed])
    expect(filter2.eventName).toEqual('Transfer')

    const filter3 = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [null, accounts[0].address],
    })
    assertType<typeof filter3>({
      abi: [event.unnamed],
      args: [null, accounts[0].address],
      eventName: 'Transfer',
      id: '0x',
      type: 'event',
    })
    expect(filter3.args).toEqual([null, accounts[0].address])
    expect(filter3.abi).toEqual([event.unnamed])
    expect(filter3.eventName).toEqual('Transfer')
  })

  test('args: fromBlock', async () => {
    await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: initialBlockNumber,
    })
    await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: 'latest',
    })
  })

  test('args: toBlock', async () => {
    await createEventFilter(publicClient, {
      event: event.default,
      toBlock: initialBlockNumber,
    })
    await createEventFilter(publicClient, {
      event: event.default,
      toBlock: 'latest',
    })
  })
})
