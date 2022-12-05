import { assertType, expect, test, vi } from 'vitest'

import { Requests } from '../../types/eip1193'

import { createAdapter } from './createAdapter'

test('default', () => {
  const adapter = createAdapter({
    key: 'mock',
    name: 'Mock Adapter',
    request: vi.fn(async () => null) as unknown as Requests['request'],
    type: 'mock',
  })

  assertType<'mock'>(adapter.config.type)
  expect(adapter).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "value": undefined,
    }
  `)
})

test('value', () => {
  const adapter = createAdapter(
    {
      key: 'mock',
      name: 'Mock Adapter',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    },
    {
      foo: 'bar',
      baz: 'foo',
    },
  )

  expect(adapter).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "mock",
        "name": "Mock Adapter",
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
