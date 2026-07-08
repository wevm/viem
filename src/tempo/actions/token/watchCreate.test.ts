import { AbiParameters, Hash, Hex, Value } from 'ox'
import { TokenRole } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

void Hex
void TokenRole
void account3
void client2
void fund

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('1', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchCreate', () => {
  test('default', async () => {
    const watcher = Actions.token.watchCreate(client)
    const logs: Actions.token.watchCreate.ReturnType extends infer _
      ? any[]
      : never = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.createSync(client, {
        currency: 'USD',
        name: 'Watch Test Token 1',
        symbol: 'WATCH1',
      })
      await Actions.token.createSync(client, {
        currency: 'USD',
        name: 'Watch Test Token 2',
        symbol: 'WATCH2',
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
    } finally {
      watcher.off()
    }
  })
  test('behavior: filter by token', async () => {
    const salt = Hex.random(32)
    const hash = Hash.keccak256(
      AbiParameters.encode(AbiParameters.from('address, bytes32'), [
        client.account!.address,
        salt,
      ]),
    )
    const token = `0x20c0${'0'.repeat(20)}${hash.slice(2, 18)}` as const
    const watcher = Actions.token.watchCreate(client, { args: { token } })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 1',
        symbol: 'FWATCH1',
      })
      const result = await Actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 2',
        salt,
        symbol: 'FWATCH2',
      })
      expect(result.token.toLowerCase()).toBe(token)
      await Actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 3',
        symbol: 'FWATCH3',
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      const { salt: tokenSalt, token: tokenAddress, ...rest } = logs[0]!.args
      expect(rest).toMatchInlineSnapshot(`
        {
          "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "currency": "USD",
          "name": "Filtered Watch Token 2",
          "quoteToken": "0x20C0000000000000000000000000000000000000",
          "symbol": "FWATCH2",
        }
      `)
      expect(tokenSalt).toBe(salt)
      expect(tokenAddress.toLowerCase()).toBe(token)
    } finally {
      watcher.off()
    }
  })
})
