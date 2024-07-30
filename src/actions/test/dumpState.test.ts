import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { dumpState } from './dumpState.js'

const client = anvilMainnet.getClient()

test('dumps state', async () => {
  expect(await dumpState(client)).toBeDefined()
})
