import { expect, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { getSupportedEntryPoints } from './getSupportedEntryPoints.js'

const client = bundlerMainnet.getBundlerClient()

test('default', async () => {
  expect(await getSupportedEntryPoints(client)).toMatchInlineSnapshot(`
    [
      "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    ]
  `)
})
