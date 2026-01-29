import type { Abi, AbiEvent, Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'

import { usdcContractConfig } from '~test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import type { Log } from '../../types/log.js'
import type { Hash, Hex } from '../../types/misc.js'
import { createContractEventFilter } from './createContractEventFilter.js'
import { createEventFilter } from './createEventFilter.js'
import { getFilterChanges } from './getFilterChanges.js'

const client = anvilMainnet.getClient()

describe('createEventFilter', () => {
  test('default', async () => {
    const filter = await createEventFilter(client)
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0]).not.toHaveProperty('eventName')
    expectTypeOf(logs[0]).not.toHaveProperty('args')
  })

  test('non-pending logs', async () => {
    const filter = await createEventFilter(client)
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].blockHash).toEqualTypeOf<Hex>()
    expectTypeOf(logs[0].blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(logs[0].logIndex).toEqualTypeOf<number>()
    expectTypeOf(logs[0].transactionHash).toEqualTypeOf<Hash>()
    expectTypeOf(logs[0].transactionIndex).toEqualTypeOf<number>()
  })

  test('pending logs', async () => {
    const filter_fromPending = await createEventFilter(client, {
      fromBlock: 'pending',
    })
    const logs_fromPending = await getFilterChanges(client, {
      filter: filter_fromPending,
    })
    expectTypeOf(logs_fromPending[0].blockHash).toEqualTypeOf<Hex | null>()
    expectTypeOf(logs_fromPending[0].blockNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(logs_fromPending[0].logIndex).toEqualTypeOf<number | null>()
    expectTypeOf(
      logs_fromPending[0].transactionHash,
    ).toEqualTypeOf<Hash | null>()
    expectTypeOf(logs_fromPending[0].transactionIndex).toEqualTypeOf<
      number | null
    >()

    const filter_toPending = await createEventFilter(client, {
      toBlock: 'pending',
    })
    const logs_toPending = await getFilterChanges(client, {
      filter: filter_toPending,
    })
    expectTypeOf(logs_toPending[0].blockHash).toEqualTypeOf<Hex | null>()
    expectTypeOf(logs_toPending[0].blockNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(logs_toPending[0].logIndex).toEqualTypeOf<number | null>()
    expectTypeOf(logs_toPending[0].transactionHash).toEqualTypeOf<Hash | null>()
    expectTypeOf(logs_toPending[0].transactionIndex).toEqualTypeOf<
      number | null
    >()

    const filter_bothPending = await createEventFilter(client, {
      fromBlock: 'pending',
      toBlock: 'pending',
    })
    const logs_bothPending = await getFilterChanges(client, {
      filter: filter_bothPending,
    })
    expectTypeOf(logs_bothPending[0].blockHash).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].blockNumber).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].logIndex).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].transactionHash).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].transactionIndex).toEqualTypeOf<null>()
  })

  test('args: event: defined inline', async () => {
    const filter = await createEventFilter(client, {
      event: {
        type: 'event',
        name: 'Foo',
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
            indexed: true,
            name: 'foo',
            type: 'address',
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'bar',
            type: 'uint256',
          },
        ],
      },
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Foo'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      owner?: Address
      spender?: Address
      foo?: Address
      value?: bigint
      bar?: bigint
    }>()
  })

  test('args: event: defined as const', async () => {
    const event = {
      type: 'event',
      name: 'Foo',
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
          indexed: true,
          name: 'foo',
          type: 'address',
        },
        {
          indexed: false,
          name: 'value',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'bar',
          type: 'uint256',
        },
      ],
    } as const
    const filter = await createEventFilter(client, {
      event,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Foo'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      owner?: Address
      spender?: Address
      foo?: Address
      value?: bigint
      bar?: bigint
    }>()
  })

  test('args: event: defined as `AbiEvent`', async () => {
    const event: AbiEvent = {
      type: 'event',
      name: 'Foo',
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
          indexed: true,
          name: 'foo',
          type: 'address',
        },
        {
          indexed: false,
          name: 'value',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'bar',
          type: 'uint256',
        },
      ],
    }
    const filter = await createEventFilter(client, {
      event,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<string>()
    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly unknown[] | Record<string, unknown>
    >()
  })

  test('args: events', async () => {
    const filter = await createEventFilter(client, {
      events: [
        {
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
              indexed: false,
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
        {
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
      ],
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [`0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer' | 'Approval'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<
      | {
          from?: Address
          to?: Address
          value?: bigint
        }
      | {
          owner?: Address
          spender?: Address
          value?: bigint
        }
    >()

    expectTypeOf(
      logs[0].eventName === 'Transfer' && logs[0].args,
    ).toEqualTypeOf<
      | false
      | {
          from?: Address
          to?: Address
          value?: bigint
        }
    >()
    expectTypeOf(
      logs[0].eventName === 'Approval' && logs[0].args,
    ).toEqualTypeOf<
      | false
      | {
          owner?: Address
          spender?: Address
          value?: bigint
        }
    >()
  })

  test('strict: named', async () => {
    const filter = await createEventFilter(client, {
      event: {
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
            indexed: false,
            name: 'value',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'foo',
            type: 'string',
          },
          {
            indexed: false,
            name: 'bar',
            type: 'string',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      strict: true,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from: `0x${string}`
      to: `0x${string}`
      value: bigint
      foo: string
      bar: string
    }>()
  })

  test('strict: unnamed', async () => {
    const filter = await createEventFilter(client, {
      event: {
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
            indexed: false,
            type: 'uint256',
          },
          {
            indexed: false,
            type: 'string',
          },
          {
            indexed: false,
            type: 'string',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      strict: true,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly [`0x${string}`, `0x${string}`, bigint, string, string]
    >()
  })
})

describe('createContractEventFilter', () => {
  const abi = [
    ...usdcContractConfig.abi,
    {
      type: 'event',
      name: 'Foo',
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
          indexed: true,
          name: 'foo',
          type: 'address',
        },
        {
          indexed: false,
          name: 'value',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'bar',
          type: 'uint256',
        },
      ],
    },
  ] as const

  test('default', async () => {
    const filter = await createContractEventFilter(client, {
      abi,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })

    expectTypeOf(logs).toEqualTypeOf<
      Log<bigint, number, false, undefined, false, typeof abi>[]
    >()
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      | [`0x${string}`, `0x${string}`, `0x${string}`]
      | [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<
      'Transfer' | 'Approval' | 'Foo'
    >()
    expectTypeOf(logs[0].args).toEqualTypeOf<
      | {
          from?: Address
          to?: Address
          value?: bigint
        }
      | {
          owner?: Address
          spender?: Address
          value?: bigint
        }
      | {
          owner?: Address
          spender?: Address
          foo?: Address
          value?: bigint
          bar?: bigint
        }
    >()

    expectTypeOf(
      logs[0].eventName === 'Transfer' && logs[0].args,
    ).toEqualTypeOf<
      | false
      | {
          from?: Address
          to?: Address
          value?: bigint
        }
    >()
    expectTypeOf(
      logs[0].eventName === 'Approval' && logs[0].args,
    ).toEqualTypeOf<
      | false
      | {
          owner?: Address
          spender?: Address
          value?: bigint
        }
    >()
    expectTypeOf(logs[0].eventName === 'Foo' && logs[0].args).toEqualTypeOf<
      | false
      | {
          owner?: Address
          spender?: Address
          foo?: Address
          value?: bigint
          bar?: bigint
        }
    >()
  })

  test('non-pending logs', async () => {
    const filter = await createContractEventFilter(client, {
      abi,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })
    expectTypeOf(logs[0].blockHash).toEqualTypeOf<Hex>()
    expectTypeOf(logs[0].blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(logs[0].logIndex).toEqualTypeOf<number>()
    expectTypeOf(logs[0].transactionHash).toEqualTypeOf<Hash>()
    expectTypeOf(logs[0].transactionIndex).toEqualTypeOf<number>()
  })

  test('pending logs', async () => {
    const filter_fromPending = await createContractEventFilter(client, {
      abi,
      fromBlock: 'pending',
    })
    const logs_fromPending = await getFilterChanges(client, {
      filter: filter_fromPending,
    })
    expectTypeOf(logs_fromPending[0].blockHash).toEqualTypeOf<Hex | null>()
    expectTypeOf(logs_fromPending[0].blockNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(logs_fromPending[0].logIndex).toEqualTypeOf<number | null>()
    expectTypeOf(
      logs_fromPending[0].transactionHash,
    ).toEqualTypeOf<Hash | null>()
    expectTypeOf(logs_fromPending[0].transactionIndex).toEqualTypeOf<
      number | null
    >()

    const filter_toPending = await createContractEventFilter(client, {
      abi,
      toBlock: 'pending',
    })
    const logs_toPending = await getFilterChanges(client, {
      filter: filter_toPending,
    })
    expectTypeOf(logs_toPending[0].blockHash).toEqualTypeOf<Hex | null>()
    expectTypeOf(logs_toPending[0].blockNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(logs_toPending[0].logIndex).toEqualTypeOf<number | null>()
    expectTypeOf(logs_toPending[0].transactionHash).toEqualTypeOf<Hash | null>()
    expectTypeOf(logs_toPending[0].transactionIndex).toEqualTypeOf<
      number | null
    >()

    const filter_bothPending = await createContractEventFilter(client, {
      abi,
      fromBlock: 'pending',
      toBlock: 'pending',
    })
    const logs_bothPending = await getFilterChanges(client, {
      filter: filter_bothPending,
    })
    expectTypeOf(logs_bothPending[0].blockHash).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].blockNumber).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].logIndex).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].transactionHash).toEqualTypeOf<null>()
    expectTypeOf(logs_bothPending[0].transactionIndex).toEqualTypeOf<null>()
  })

  test('args: eventName', async () => {
    const filter = await createContractEventFilter(client, {
      abi,
      eventName: 'Foo',
    })
    const logs = await getFilterChanges(client, {
      filter,
    })

    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Foo'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      owner?: Address
      spender?: Address
      foo?: Address
      value?: bigint
      bar?: bigint
    }>()
  })

  test('args: abi: defined inline', async () => {
    const filter = await createContractEventFilter(client, {
      abi: [
        {
          type: 'event',
          name: 'Foo',
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
              indexed: true,
              name: 'foo',
              type: 'address',
            },
            {
              indexed: false,
              name: 'value',
              type: 'uint256',
            },
            {
              indexed: false,
              name: 'bar',
              type: 'uint256',
            },
          ],
        },
      ],
    })
    const logs = await getFilterChanges(client, {
      filter,
    })

    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Foo'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      owner?: Address
      spender?: Address
      foo?: Address
      value?: bigint
      bar?: bigint
    }>()
  })

  test('args: abi: declared as `Abi`', async () => {
    const abi: Abi = [
      {
        type: 'event',
        name: 'Foo',
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
            indexed: true,
            name: 'foo',
            type: 'address',
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256',
          },
          {
            indexed: false,
            name: 'bar',
            type: 'uint256',
          },
        ],
      },
    ]
    const filter = await createContractEventFilter(client, {
      abi,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })

    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<string>()
    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly unknown[] | Record<string, unknown>
    >()
  })

  test('strict', async () => {
    const filter = await createContractEventFilter(client, {
      abi,
      strict: true,
    })
    const logs = await getFilterChanges(client, {
      filter,
    })

    expectTypeOf(logs[0].args).toEqualTypeOf<
      | {
          from: Address
          to: Address
          value: bigint
        }
      | {
          owner: Address
          spender: Address
          value: bigint
        }
      | {
          owner: Address
          spender: Address
          foo: Address
          value: bigint
          bar: bigint
        }
    >()
  })
})
