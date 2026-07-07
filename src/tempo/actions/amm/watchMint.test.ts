import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function createToken() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'AMM Watch Mint Token',
    symbol: 'AMM-WMINT',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000', 6),
    to: account.address,
    token,
  })
  return token
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchMint', () => {
  test('default', async () => {
    const token = await createToken()
    const watcher = Actions.amm.watchMint(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.amm.mintSync(client, {
        to: account.address,
        userTokenAddress: token,
        validatorTokenAddress: 1n,
        validatorTokenAmount: Value.from('100', 6),
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.userToken).toBe(token)
      expect(logs[0]!.args.validatorToken.toLowerCase()).toBe(tempo.alphaUsd)
      expect(logs[0]!.args.amountValidatorToken).toBe(Value.from('100', 6))
    } finally {
      watcher.off()
    }
  })
})
