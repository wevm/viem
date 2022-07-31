import { expect, test } from 'vitest'

import { createBaseProvider } from './createBaseProvider'

test('creates', () => {
  const provider = createBaseProvider({
    request: <any>(async () => null),
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "request": [Function],
    }
  `)
})
