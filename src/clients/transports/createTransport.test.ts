import { assertType, expect, test, vi } from 'vitest'

import type { Requests } from '../../types/eip1193.js'

import { createTransport } from './createTransport.js'

test('default', () => {
  const transport = createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: vi.fn(async () => null) as unknown as Requests['request'],
    type: 'mock',
  })

  assertType<'mock'>(transport.config.type)

  expect(transport).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "request": [Function],
      "value": undefined,
    }
  `)
})

test('value', () => {
  const transport = createTransport(
    {
      key: 'mock',
      name: 'Mock Transport',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    },
    {
      foo: 'bar',
      baz: 'foo',
    },
  )

  expect(transport).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "request": [Function],
      "value": {
        "baz": "foo",
        "foo": "bar",
      },
    }
  `)
})
