import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "getEnsAddress": [Function],
      "getEnsAvatar": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
      "getEnsText": [Function],
    }
  `)
})
