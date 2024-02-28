import { afterAll, beforeAll, expect, test } from 'vitest'
import { createTevmServer } from '../../../../test/src/utils.js'
import { optimism } from '../chains.js'
import { portalVersion } from './portalVersion.js'

let server: Awaited<ReturnType<typeof createTevmServer>>['server']
let publicClient: Awaited<ReturnType<typeof createTevmServer>>['publicClient']

beforeAll(async () => {
  const res = await createTevmServer()
  server = res.server
  publicClient = res.publicClient
})

afterAll(async () => {
  await server.close()
})

test('returns the portal version', async () => {
  const output = await portalVersion(publicClient, {
    targetChain: optimism,
  })
  expect(output).toEqual({
    major: 3,
    minor: 0,
    patch: 0,
  })
})
