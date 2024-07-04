import { expect, test } from 'vitest'

import { UrlRequiredError } from './transport.js'

test('UrlRequiredError', () => {
  expect(new UrlRequiredError()).toMatchInlineSnapshot(`
    [ViemError: No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/docs/clients/intro
    Version: viem@x.y.z]
  `)
})
