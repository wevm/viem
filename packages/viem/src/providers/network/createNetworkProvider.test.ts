import { expect, test } from 'vitest'

import { createNetworkProvider } from './createNetworkProvider'

test('creates', () => {
  const provider = createNetworkProvider({
    request: <any>(async () => null),
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})
