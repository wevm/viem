import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { setRpcUrl } from './setRpcUrl.js'

const client = anvilMainnet.getClient()

test('sets the rpc url', async () => {
  await expect(setRpcUrl(client, anvilMainnet.forkUrl)).resolves.toBeUndefined()
})
