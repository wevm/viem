import { expect, test } from 'vitest'

import * as signers from './index'

test('exports signers', () => {
  expect(signers).toMatchInlineSnapshot(`
    {
      "createSigner": [Function],
      "watchSigner": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
