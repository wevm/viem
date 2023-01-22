import { assertType, describe, expect, test, vi } from 'vitest'
import '../../types/window'

import type { Requests } from '../../types/eip1193'

import type { CustomTransport } from './custom'
import { custom } from './custom'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn(() => null),
    removeListener: vi.fn(() => null),
    request: vi.fn(() => null),
  },
})

test('default', () => {
  const transport = custom({
    request: vi.fn(async () => null) as unknown as Requests['request'],
  })

  assertType<CustomTransport>(transport)
  assertType<'custom'>(transport({}).config.type)

  expect(transport({})).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "custom",
        "name": "Custom Provider",
        "request": [Function],
        "type": "custom",
      },
      "value": undefined,
    }
  `)
})

describe('config', () => {
  test('provider', () => {
    const transport = custom(window.ethereum!)({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "custom",
          "name": "Custom Provider",
          "request": [Function],
          "type": "custom",
        },
        "value": undefined,
      }
    `)
  })

  test('key', () => {
    const transport = custom(
      {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
      { key: 'mock' },
    )({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "Custom Provider",
          "request": [Function],
          "type": "custom",
        },
        "value": undefined,
      }
    `)
  })

  test('name', () => {
    const transport = custom(
      {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
      {
        name: 'Mock Transport',
      },
    )({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "custom",
          "name": "Mock Transport",
          "request": [Function],
          "type": "custom",
        },
        "value": undefined,
      }
    `)
  })
})
