import { expect, test } from 'vitest'
import { publicClientMainnet, sepoliaClient } from '../../../test/src/utils.js'
import { base, optimismSepolia } from '../../op-stack/chains.js'
import { getPortalVersion } from './getPortalVersion.js'

test('default', async () => {
  const version = await getPortalVersion(publicClientMainnet, {
    targetChain: base,
  })
  expect(version).toMatchInlineSnapshot(`
    {
      "major": 1,
      "minor": 7,
      "patch": 0,
    }
  `)
})

test('sepolia', async () => {
  const version = await getPortalVersion(sepoliaClient, {
    targetChain: optimismSepolia,
  })
  expect(version).toMatchInlineSnapshot(`
    {
      "major": 3,
      "minor": 3,
      "patch": 0,
    }
  `)
})

test('args: portalAddress', async () => {
  const version = await getPortalVersion(sepoliaClient, {
    portalAddress: '0xeffE2C6cA9Ab797D418f0D91eA60807713f3536f',
  })
  expect(version).toMatchInlineSnapshot(`
    {
      "major": 1,
      "minor": 7,
      "patch": 2,
    }
  `)
})
