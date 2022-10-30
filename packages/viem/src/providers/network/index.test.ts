import { expect, test } from 'vitest'

import * as providers from './index'

test('exports providers', () => {
  expect(providers).toMatchInlineSnapshot(`
    {
      "httpProvider": [Function],
      "webSocketProvider": [Function],
    }
  `)
})
