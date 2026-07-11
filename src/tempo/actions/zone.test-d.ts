import { expectTypeOf, test } from 'vitest'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import * as zoneActions from './zone.js'

const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport: custom({
    async request() {
      return null
    },
  }),
})

test('encryptedDeposit.prepare returns a reusable encrypted deposit payload', async () => {
  const prepared = await zoneActions.encryptedDeposit.prepare(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    bouncebackRecipient: '0x0000000000000000000000000000000000000001',
    recipient: '0x0000000000000000000000000000000000000001',
    zoneId: 7,
  })

  expectTypeOf(prepared).toEqualTypeOf<zoneActions.PreparedEncryptedDeposit>()

  zoneActions.encryptedDeposit.calls(prepared)
  await zoneActions.encryptedDeposit(client, prepared)
  await zoneActions.encryptedDepositSync(client, prepared)
})

test('encryptedDeposit still accepts plaintext parameters', async () => {
  await zoneActions.encryptedDeposit(client, {
    token: '0x20c0000000000000000000000000000000000000',
    amount: 1n,
    zoneId: 7,
  })
})

test('getEncryptionKey returns the active key and index', async () => {
  const result = await zoneActions.getEncryptionKey(client, { zoneId: 7 })

  expectTypeOf(result).toEqualTypeOf<zoneActions.getEncryptionKey.ReturnValue>()
  expectTypeOf(result.publicKey.yParity).toEqualTypeOf<2 | 3>()
  zoneActions.getEncryptionKey.calls({
    portalAddress: '0x0000000000000000000000000000000000000001',
  })
})

test('waitForDepositStatus returns a deposit status', async () => {
  const result = await zoneActions.waitForDepositStatus(client, {
    tempoBlockNumber: 1n,
  })

  expectTypeOf(result).toEqualTypeOf<zoneActions.getDepositStatus.ReturnType>()
})
