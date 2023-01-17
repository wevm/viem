import { assertType, describe, expect, test, vi } from 'vitest'
import '../../types/window'

import type { Requests } from '../../types/eip1193'

import type { EthereumProviderTransport } from './ethereumProvider'
import { ethereumProvider } from './ethereumProvider'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn(() => null),
    removeListener: vi.fn(() => null),
    request: vi.fn(() => null),
  },
})

test('default', () => {
  const transport = ethereumProvider({
    provider: {
      request: vi.fn(async () => null) as unknown as Requests['request'],
    },
  })

  assertType<EthereumProviderTransport>(transport)
  assertType<'ethereumProvider'>(transport({}).config.type)

  expect(transport({})).toMatchInlineSnapshot(`
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
    const transport = ethereumProvider({
      provider: window.ethereum!,
    })({})

    expect(transport).toMatchInlineSnapshot(`
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
    const transport = ethereumProvider({
      key: 'mock',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })({})

    expect(transport).toMatchInlineSnapshot(`
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
    const transport = ethereumProvider({
      name: 'Mock Transport',
      provider: {
        request: vi.fn(async () => null) as unknown as Requests['request'],
      },
    })({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "ethereumProvider",
          "name": "Mock Transport",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "value": undefined,
      }
    `)
  })
})
