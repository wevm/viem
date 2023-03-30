import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getEnsAddress": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
    }
  `)
})
