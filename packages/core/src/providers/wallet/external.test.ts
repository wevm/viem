import { expect, test } from 'vitest'

import { externalProvider } from './external'

test('creates', () => {
  const fooProvider = {
    on: () => null,
    removeListener: () => null,
    request: <any>(() => null),
  }
  const { uid, ...provider } = externalProvider(fooProvider)
  expect(uid).toBeDefined()
  expect(provider).toMatchInlineSnapshot(`
    {
      "key": "external",
      "name": "External",
      "on": [Function],
      "pollingInterval": 4000,
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
