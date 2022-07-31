import { expect, test } from 'vitest'

import { externalProvider } from './externalProvider'

test('creates', () => {
  const fooProvider = {
    on: () => null,
    removeListener: () => null,
    request: <any>(() => null),
  }
  const provider = externalProvider(fooProvider)
  expect(provider).toMatchInlineSnapshot(`
    {
      "on": [Function],
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
