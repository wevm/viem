import { expect, test } from 'vitest'

import { setRpcUrl } from './setRpcUrl.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

const client = anvilMainnet.getClient()

test('sets the rpc url', async () => {
  await expect(setRpcUrl(client, anvilMainnet.forkUrl)).resolves.toBeUndefined()
})
