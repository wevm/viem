import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "requestAccounts": [Function],
      "sendTransaction": [Function],
    }
  `)
})
