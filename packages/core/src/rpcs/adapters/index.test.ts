import { expect, test } from 'vitest'

import * as adapters from './index'

test('exports adapters', () => {
  expect(adapters).toMatchInlineSnapshot(`
    {
      "createAdapter": [Function],
      "external": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
