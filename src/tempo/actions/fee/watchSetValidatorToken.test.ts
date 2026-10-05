import * as tempo from '~test/tempo.js'
import { Value } from 'ox'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const validatorClient = tempo.getClient({
  account: validator,
  feeToken: tempo.pathUsd,
})

beforeAll(async () => {
  await tempo.registerValidator(client, { address: validator.address })
  await Actions.token.transferSync(client, {
    amount: Value.from('100', 6),
    to: validator.address,
    token: tempo.pathUsd,
  })
})

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchSetValidatorToken', () => {
  test('default', async () => {
    const watcher = Actions.fee.watchSetValidatorToken(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.fee.setValidatorTokenSync(validatorClient, {
        token: '0x20c0000000000000000000000000000000000001',
      })
      await Actions.fee.setValidatorTokenSync(validatorClient, {
        token: '0x20c0000000000000000000000000000000000002',
      })

      await waitForLogs(logs, 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000001",
          "validator": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000002",
          "validator": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by validator address', async () => {
    const watcher = Actions.fee.watchSetValidatorToken(client, {
      args: { validator: validator.address },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.fee.setValidatorTokenSync(validatorClient, {
        token: '0x20c0000000000000000000000000000000000001',
      })

      await waitForLogs(logs, 1)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.validator).toBe(validator.address)
    } finally {
      watcher.off()
    }
  })
})
