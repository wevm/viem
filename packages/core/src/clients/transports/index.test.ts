import { expect, test } from 'vitest'

import * as transports from './index'

test('exports transports', () => {
  expect(transports).toMatchInlineSnapshot(`
    {
      "createTransport": [Function],
      "ethereumProvider": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
