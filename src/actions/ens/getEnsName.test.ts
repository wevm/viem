import { expect, test } from 'vitest'

import { address, publicClient } from '../../_test'

import { getEnsName } from './getEnsName'

test('gets primary name for address', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot('"awkweb.eth"')
})

test('address with no primary name', async () => {
  await expect(
    getEnsName(publicClient, {
      address: address.burn,
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot('null')
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    }),
  ).resolves.toMatchInlineSnapshot('null')
})
