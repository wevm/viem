import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockHash,
  zkSyncClientLocalNodeWithAccount,
} from '../../../../test/src/zksync.js'
import { waitFinalize } from './waitFinalize.js'

const client = { ...zkSyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const result = await waitFinalize(client, {
    hash: mockHash,
  })
  expect(result).toBeDefined()
})
