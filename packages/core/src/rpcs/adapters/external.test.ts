import { assertType, describe, expect, test, vi } from 'vitest'
import '../../types/window'

import { Requests } from '../../types/eip1193'

import { external } from './external'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn(() => null),
    removeListener: vi.fn(() => null),
    request: vi.fn(() => null),
  },
})

test('default', () => {
  const adapter = external({
    provider: {
      request: vi.fn(async () => null) as unknown as Requests['request'],
    },
  })

  assertType<'external'>(adapter.config.type)
  expect(adapter).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "external",
        "name": "External",
        "request": [Function],
        "type": "external",
      },
      "value": undefined,
    }
  `)
})

describe('config', () => {
  test('provider', () => {
    const adapter = external({
      provider: window.ethereum!,
    })

    assertType<'external'>(adapter.config.type)
    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "external",
          "name": "External",
          "request": [Function],
          "type": "external",
        },
        "value": undefined,
      }
    `)
  })

  test('key', () => {
    const adapter = external({
      key: 'mock',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })

    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "External",
          "request": [Function],
          "type": "external",
        },
        "value": undefined,
      }
    `)
  })

  test('name', () => {
    const adapter = external({
      name: 'Mock Adapter',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })

    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "external",
          "name": "Mock Adapter",
          "request": [Function],
          "type": "external",
        },
        "value": undefined,
      }
    `)
  })
})
