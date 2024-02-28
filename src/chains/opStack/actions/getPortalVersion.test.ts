import { beforeAll, expect, test } from 'vitest'
import { createL1Server } from '../../../../test/src/opStack.js'
import { optimism } from '../chains.js'
import { getPortalVersion } from './getPortalVersion.js'

let publicClient: Awaited<ReturnType<typeof createL1Server>>['publicClient']

beforeAll(async () => {
  const res = await createL1Server()
  publicClient = res.publicClient
  return res.server.close
})

test('returns the portal version', async () => {
  const output = await getPortalVersion(publicClient, {
    targetChain: optimism,
  })
  expect(output).toEqual({
    major: 3,
    minor: 0,
    patch: 0,
  })
})
