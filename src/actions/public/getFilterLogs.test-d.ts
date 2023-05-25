import { describe, expectTypeOf, test } from 'vitest'

import { usdcContractConfig } from '../../_test/abis.js'
import { publicClient } from '../../_test/utils.js'
import type { Log } from '../../types/log.js'
import { createContractEventFilter } from './createContractEventFilter.js'
import { createEventFilter } from './createEventFilter.js'
import { getFilterLogs } from './getFilterLogs.js'
import type { Abi, AbiEvent, Address } from 'abitype'

describe('createEventFilter', () => {
  test('default', async () => {
    const filter = await createEventFilter(publicClient)
    const logs = await getFilterLogs(publicClient, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0]).not.toHaveProperty('eventName')
    expectTypeOf(logs[0]).not.toHaveProperty('args')
  })

  test('args: event: defined inline', async () => {
    const filter = await createEventFilter(publicClient, {
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
    const logs = await getFilterLogs(publicClient, {
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
    const filter = await createEventFilter(publicClient, {
      event,
    })
    const logs = await getFilterLogs(publicClient, {
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
    const filter = await createEventFilter(publicClient, {
      event,
    })
    const logs = await getFilterLogs(publicClient, {
      filter,
    })
    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<string>()
    expectTypeOf(logs[0].args).toEqualTypeOf<readonly unknown[]>()
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
    const filter = await createContractEventFilter(publicClient, {
      abi,
    })
    const logs = await getFilterLogs(publicClient, {
      filter,
    })

    expectTypeOf(logs).toEqualTypeOf<
      Log<bigint, number, undefined, typeof abi>[]
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
  })

  test('args: eventName', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi,
      eventName: 'Foo',
    })
    const logs = await getFilterLogs(publicClient, {
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
    const filter = await createContractEventFilter(publicClient, {
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
    const logs = await getFilterLogs(publicClient, {
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
    const filter = await createContractEventFilter(publicClient, {
      abi,
    })
    const logs = await getFilterLogs(publicClient, {
      filter,
    })

    expectTypeOf(logs[0].topics).toEqualTypeOf<
      [] | [`0x${string}`, ...`0x${string}`[]]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<string>()
    expectTypeOf(logs[0].args).toEqualTypeOf<readonly unknown[]>()
  })
})
