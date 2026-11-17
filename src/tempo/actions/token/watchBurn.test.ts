import { Hex, Value } from 'ox'
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

describe('watchBurn', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn Watch Token',
      symbol: 'BURN',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('200', 6),
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('100', 6),
      to: account2.address,
      token,
    })
    await fund(account2.address)
    const watcher = Actions.token.watchBurn(client, { token })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.burnSync(client, {
        amount: Value.from('50', 6),
        token,
      })
      await Actions.token.burnSync(client2, {
        amount: Value.from('25', 6),
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs.map((log) => log.args)).toMatchInlineSnapshot(`
        [
          {
            "amount": 50000000n,
            "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          },
          {
            "amount": 25000000n,
            "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          },
        ]
      `)
    } finally {
      watcher.off()
    }
  })
  test('behavior: filter by from address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Burn Token',
      symbol: 'FBURN',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('200', 6),
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('200', 6),
      to: account2.address,
      token,
    })
    await fund(account2.address)
    const watcher = Actions.token.watchBurn(client, {
      args: { from: client.account!.address },
      token,
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.burnSync(client, {
        amount: Value.from('50', 6),
        token,
      })
      await Actions.token.burnSync(client2, {
        amount: Value.from('25', 6),
        token,
      })
      await Actions.token.burnSync(client, {
        amount: Value.from('75', 6),
        token,
      })
      await waitForLogs(logs, 2)
      expect(logs).toHaveLength(2)
      expect(logs.map((log) => log.args.from)).toEqual([
        client.account!.address,
        client.account!.address,
      ])
    } finally {
      watcher.off()
    }
  })
})
