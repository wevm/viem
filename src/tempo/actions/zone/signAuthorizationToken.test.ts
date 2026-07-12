import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Client as CoreClient, http as coreHttp } from 'viem'
import { Account, Client, http, Storage } from 'viem/tempo'

import { zoneModerato } from '../../zones/zone.js'
import { signAuthorizationToken } from './signAuthorizationToken.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)

// `signAuthorizationToken` signs and stores locally — no RPC is made, so a
// zone chain declaration over the pool transport keeps the test hermetic.
const client = Client.create({
  account,
  chain: zoneModerato(7),
  transport: http(tempo.rpcUrl),
})

test('default', async () => {
  const storage = Storage.memory()
  const { authentication, token } = await signAuthorizationToken(client, {
    storage,
  })

  expect(authentication.chainId).toBe(client.chain.id)
  expect(authentication.zoneId).toBe(7)
  expect(token).toBeDefined()
  expect(typeof token).toBe('string')
  expect(token.length).toBeGreaterThan(0)
})

test('behavior: custom issuedAt/expiresAt/storage', async () => {
  const storage = Storage.memory()
  const issuedAt = Math.floor(Date.now() / 1000) - 100
  const expiresAt = issuedAt + 300

  const { authentication, token } = await signAuthorizationToken(client, {
    expiresAt,
    issuedAt,
    storage,
    zoneId: 0,
  })

  expect(authentication.issuedAt).toBe(issuedAt)
  expect(authentication.expiresAt).toBe(expiresAt)
  expect(authentication.zoneId).toBe(0)

  const stored = await storage.getItem(`auth:token:${client.chain.id}`)
  expect(stored).toBe(token)
})

test('error: no chain', async () => {
  const client = CoreClient.create({
    account,
    transport: coreHttp(tempo.rpcUrl),
  })

  await expect(
    signAuthorizationToken(client, { storage: Storage.memory() }),
  ).rejects.toThrow('`signAuthorizationToken` requires a chain.')
})

test('error: no account', async () => {
  const client = Client.create({
    chain: zoneModerato(7),
    transport: http(tempo.rpcUrl),
  })

  await expect(
    signAuthorizationToken(client, { storage: Storage.memory() }),
  ).rejects.toThrow('`account` with `sign` is required.')
})
