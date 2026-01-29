import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getAutomine } from './getAutomine.js'
import { setAutomine } from './setAutomine.js'

const client = anvilMainnet.getClient()

// TODO: Anvil sometimes stops interval mining when automining is programmatically set.
test.skip('sets automine status', async () => {
  await expect(setAutomine(client, true)).resolves.toBeUndefined()
  expect(await getAutomine(client)).toEqual(true)
  await setAutomine(client, false)
  expect(await getAutomine(client)).toEqual(false)
})
