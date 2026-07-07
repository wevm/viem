import * as Hex from 'ox/Hex'
import * as TokenId from 'ox/tempo/TokenId'
import * as TokenRole from 'ox/tempo/TokenRole'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

void Hex
void TokenId
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

describe('watchMint', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mint Watch Token',
      symbol: 'MINT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    const watcher = Actions.token.watchMint(client, { token })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.mintSync(client, {
        amount: Value.from('100', 6),
        to: account2.address,
        token,
      })
      await Actions.token.mintSync(client, {
        amount: Value.from('50', 6),
        to: account3.address,
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs.map((log) => log.args)).toMatchInlineSnapshot(`
        [
          {
            "amount": 100000000n,
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          },
          {
            "amount": 50000000n,
            "to": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
        ]
      `)
    } finally {
      watcher.off()
    }
  })
  test('behavior: filter by to address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Mint Token',
      symbol: 'FMINT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    const watcher = Actions.token.watchMint(client, {
      args: { to: account2.address },
      token,
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.mintSync(client, {
        amount: Value.from('100', 6),
        to: account2.address,
        token,
      })
      await Actions.token.mintSync(client, {
        amount: Value.from('50', 6),
        to: account3.address,
        token,
      })
      await Actions.token.mintSync(client, {
        amount: Value.from('75', 6),
        to: account2.address,
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs.map((log) => log.args.to)).toEqual([
        account2.address,
        account2.address,
      ])
    } finally {
      watcher.off()
    }
  })
})
