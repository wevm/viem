import { expect, test } from 'vp/test'

import * as siwe from './index.js'

test('exports', () => {
  expect(Object.keys(siwe).sort()).toMatchInlineSnapshot(`
    [
      "InvalidMessageFieldError",
      "createMessage",
      "domainRegex",
      "generateNonce",
      "ipRegex",
      "isUri",
      "localhostRegex",
      "nonceRegex",
      "parseMessage",
      "prefixRegex",
      "schemeRegex",
      "suffixRegex",
      "validateMessage",
    ]
  `)
})
