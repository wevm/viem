import { beforeAll, expect, test } from 'vitest'
import { createTevmServer } from '../../../../test/src/utils.js'
import { optimism } from '../chains.js'
import { getPortalVersion } from './getPortalVersion.js'

let publicClient: Awaited<ReturnType<typeof createTevmServer>>['publicClient']

beforeAll(async () => {
  const res = await createTevmServer()
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
