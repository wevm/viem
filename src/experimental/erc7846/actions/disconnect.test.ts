import { test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { disconnect } from './disconnect.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await disconnect(client)
})
