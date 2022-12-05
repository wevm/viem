import { expect, test } from 'vitest'

import * as adapters from './index'

test('exports adapters', () => {
  expect(adapters).toMatchInlineSnapshot(`
    {
      "createAdapter": [Function],
      "ethereumProvider": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
