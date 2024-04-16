import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getAllBalances } from './getAllBalances.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const balances = await getAllBalances(client, {
    address: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
  })

  const entries = Object.entries(balances)
  for (const [key, value] of entries) {
    expect(typeof key).toBe('string')
    expect(typeof value).toBe('bigint')
  }
})
