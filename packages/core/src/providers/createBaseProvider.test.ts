import { expect, test } from 'vitest'

import { createBaseProvider } from './createBaseProvider'

test('creates', () => {
  const { uid, ...provider } = createBaseProvider({
    key: 'base',
    name: 'Base',
    request: <any>(async () => null),
    type: 'baseProvider',
  })

  expect(uid).toBeDefined()
  expect(provider).toMatchInlineSnapshot(`
    {
      "key": "base",
      "name": "Base",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "baseProvider",
    }
  `)
})
