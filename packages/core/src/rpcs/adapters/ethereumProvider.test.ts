import { assertType, describe, expect, test, vi } from 'vitest'
import '../../types/window'

import { Requests } from '../../types/eip1193'

import { ethereumProvider } from './ethereumProvider'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn(() => null),
    removeListener: vi.fn(() => null),
    request: vi.fn(() => null),
  },
})

test('default', () => {
  const adapter = ethereumProvider({
    provider: {
      request: vi.fn(async () => null) as unknown as Requests['request'],
    },
  })

  assertType<'ethereumProvider'>(adapter.config.type)
  expect(adapter).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "ethereumProvider",
        "name": "Ethereum Provider",
        "request": [Function],
        "type": "ethereumProvider",
      },
      "value": undefined,
    }
  `)
})

describe('config', () => {
  test('provider', () => {
    const adapter = ethereumProvider({
      provider: window.ethereum!,
    })

    assertType<'ethereumProvider'>(adapter.config.type)
    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "value": undefined,
      }
    `)
  })

  test('key', () => {
    const adapter = ethereumProvider({
      key: 'mock',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })

    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "value": undefined,
      }
    `)
  })

  test('name', () => {
    const adapter = ethereumProvider({
      name: 'Mock Adapter',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })

    expect(adapter).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "ethereumProvider",
          "name": "Mock Adapter",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "value": undefined,
      }
    `)
  })
})
