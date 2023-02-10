import { expect, test } from 'vitest'

import { publicClient } from '../../_test'
import { getEnsAddress } from './getEnsAddress'

test('gets address for name', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('gets address for name', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('name without address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'unregistered-name.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0x0000000000000000000000000000000000000000"',
  )
})
