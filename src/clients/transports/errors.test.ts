import { expect, test } from 'vitest'

import { UrlRequiredError } from './errors'

test('UrlRequiredError', () => {
  expect(new UrlRequiredError()).toMatchInlineSnapshot(`
    [ViemError: No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/TODO

    Version: viem@1.0.2]
  `)
})
