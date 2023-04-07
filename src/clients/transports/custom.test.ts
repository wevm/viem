import { assertType, describe, expect, test, vi } from 'vitest'
import '../../types/window.js'

import type { Requests } from '../../types/eip1193.js'

import type { CustomTransport } from './custom.js'
import { custom } from './custom.js'

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
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "custom",
      },
      "request": [Function],
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
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "request": [Function],
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
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "request": [Function],
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
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "request": [Function],
        "value": undefined,
      }
    `)
  })
})
