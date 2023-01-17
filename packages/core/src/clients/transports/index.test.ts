import { expect, test } from 'vitest'

import * as transports from './index'

test('exports transports', () => {
  expect(transports).toMatchInlineSnapshot(`
    {
      "UrlRequiredError": [Function],
      "createTransport": [Function],
      "ethereumProvider": [Function],
      "fallback": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
