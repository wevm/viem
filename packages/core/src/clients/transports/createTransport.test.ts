import { assertType, expect, test, vi } from 'vitest'

import { Requests } from '../../types/eip1193'

import { createTransport } from './createTransport'

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
        "type": "mock",
      },
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
        "type": "mock",
      },
      "value": {
        "baz": "foo",
        "foo": "bar",
      },
    }
  `)
})
